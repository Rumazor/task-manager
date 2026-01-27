import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Like, In } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { Task } from './task.entity';
import { User } from 'src/users/user.entity';
import { Project } from 'src/projects/project.entity';
import { CreateTaskDto, TaskCreatedResponseDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-dto';
import { TaskResponseDto } from './dto/find-one.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { UserService } from 'src/users/user.service';
import { TagService } from 'src/tags/tag.service';
import { CacheService } from 'src/cache/cache.service';
import { EventsGateway } from 'src/websockets/events.gateway';

@Injectable()
export class TaskService {
  private readonly CACHE_TTL = 300000; // 5 minutes in ms

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private readonly userService: UserService,
    private readonly tagService: TagService,
    private readonly cacheService: CacheService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<TaskCreatedResponseDto> {
    const { assignedToId, tagIds, parentTaskId, projectId, dueDate, ...rest } = createTaskDto;

    const task = this.taskRepository.create({
      ...rest,
      user,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    if (assignedToId) {
      const assignedUser = await this.userService.findOneByUuid(assignedToId);
      if (!assignedUser) {
        throw new NotFoundException(
          `Usuario asignado con UUID ${assignedToId} no encontrado`,
        );
      }
      task.assignedTo = assignedUser;
    }

    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagService.findByIds(tagIds, user);
      task.tags = tags;
    }

    if (parentTaskId) {
      const parentTask = await this.findOneEntity(parentTaskId);
      task.parentTask = parentTask;
    }

    if (projectId) {
      const project = await this.projectRepository.findOne({ where: { id: projectId } });
      if (project) {
        task.project = project;
      }
    }

    await this.taskRepository.save(task);

    const responseData: any = {
      id: task.id,
      created_by: user.email,
      title: task.title,
      description: task.description,
      completed: task.completed,
      created_at: task.created_at,
      user_id: user.id,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags || [],
    };

    if (task.assignedTo) {
      responseData.assignedTo = {
        id: task.assignedTo.id,
        email: task.assignedTo.email,
      };
    }

    if (task.parentTask) {
      responseData.parentTaskId = task.parentTask.id;
    }

    if (task.project) {
      responseData.projectId = task.project.id;
    }

    // Invalidate task caches
    await this.cacheService.invalidateTaskCaches();
    await this.cacheService.invalidateUserCaches(user.id);

    // Emit real-time event
    this.eventsGateway.emitTaskCreated(responseData, user.id);

    // Send notification to assigned user if different from creator
    if (task.assignedTo && task.assignedTo.id !== user.id) {
      this.eventsGateway.sendNotificationToUser(task.assignedTo.id, {
        type: 'task_assigned',
        title: 'Nueva tarea asignada',
        message: `${user.email} te asignó la tarea "${task.title}"`,
        taskId: task.id,
        createdAt: new Date(),
      });
    }

    return {
      message: 'Task creado correctamente',
      data: responseData,
    };
  }

  async findAll(filters?: TaskFilterDto): Promise<any[]> {
    // Generate cache key based on filters
    const cacheKey = filters
      ? `tasks:list:${JSON.stringify(filters)}`
      : CacheService.KEYS.TASKS_LIST;

    // Try to get from cache
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.tags', 'tags')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .leftJoinAndSelect('task.parentTask', 'parentTask');

    // Apply filters
    if (filters) {
      if (filters.priority) {
        queryBuilder.andWhere('task.priority = :priority', { priority: filters.priority });
      }

      if (filters.completed !== undefined) {
        queryBuilder.andWhere('task.completed = :completed', { completed: filters.completed });
      }

      if (filters.dueBefore) {
        queryBuilder.andWhere('task.dueDate <= :dueBefore', { dueBefore: new Date(filters.dueBefore) });
      }

      if (filters.dueAfter) {
        queryBuilder.andWhere('task.dueDate >= :dueAfter', { dueAfter: new Date(filters.dueAfter) });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(task.title ILIKE :search OR task.description ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }

      if (filters.tagId) {
        queryBuilder.andWhere('tags.id = :tagId', { tagId: filters.tagId });
      }

      if (filters.assignedToId) {
        queryBuilder.andWhere('assignedTo.id = :assignedToId', { assignedToId: filters.assignedToId });
      }

      if (filters.userId) {
        queryBuilder.andWhere('user.id = :userId', { userId: filters.userId });
      }
    }

    // Only get top-level tasks (not subtasks)
    queryBuilder.andWhere('task.parentTask IS NULL');

    queryBuilder.orderBy('task.position', 'ASC');
    queryBuilder.addOrderBy('task.created_at', 'DESC');

    // Pagination
    if (filters?.page && filters?.limit) {
      const skip = (filters.page - 1) * filters.limit;
      queryBuilder.skip(skip).take(filters.limit);
    }

    const tasks = await queryBuilder.getMany();
    const result = tasks.map((task) => this.sanitizeTask(task));

    // Cache the result
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 20,
    filters?: TaskFilterDto,
  ): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.tags', 'tags')
      .leftJoinAndSelect('task.subtasks', 'subtasks');

    // Apply filters
    if (filters) {
      if (filters.priority) {
        queryBuilder.andWhere('task.priority = :priority', { priority: filters.priority });
      }

      if (filters.completed !== undefined) {
        queryBuilder.andWhere('task.completed = :completed', { completed: filters.completed });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(task.title ILIKE :search OR task.description ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }
    }

    queryBuilder.andWhere('task.parentTask IS NULL');
    queryBuilder.orderBy('task.position', 'ASC');
    queryBuilder.addOrderBy('task.created_at', 'DESC');

    const total = await queryBuilder.getCount();
    const skip = (page - 1) * limit;

    const tasks = await queryBuilder.skip(skip).take(limit).getMany();
    const sanitizedTasks = tasks.map((task) => this.sanitizeTask(task));

    return {
      data: sanitizedTasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<TaskResponseDto> {
    const cacheKey = CacheService.KEYS.TASK_DETAIL(id);

    // Try to get from cache
    const cached = await this.cacheService.get<TaskResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'assignedTo', 'tags', 'subtasks', 'parentTask'],
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const result = this.sanitizeTask(task) as TaskResponseDto;

    // Cache the result
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async updateTask(id: number, updateTaskDto: UpdateTaskDto, user?: User): Promise<any> {
    const existingTask = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'tags', 'project'],
    });

    if (!existingTask) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const { assignedToId, tagIds, parentTaskId, projectId, dueDate, ...rest } = updateTaskDto;

    Object.assign(existingTask, rest);

    if (dueDate !== undefined) {
      existingTask.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (assignedToId) {
      const assignedUser = await this.userService.findOneByUuid(assignedToId);
      if (!assignedUser) {
        throw new NotFoundException(
          `Usuario asignado con UUID ${assignedToId} no encontrado`,
        );
      }
      existingTask.assignedTo = assignedUser;
    }

    if (tagIds !== undefined && user) {
      const tags = await this.tagService.findByIds(tagIds, user);
      existingTask.tags = tags;
    }

    if (parentTaskId !== undefined) {
      if (parentTaskId === null) {
        existingTask.parentTask = null;
      } else {
        const parentTask = await this.findOneEntity(parentTaskId);
        existingTask.parentTask = parentTask;
      }
    }

    if (projectId !== undefined) {
      if (projectId === null) {
        existingTask.project = null;
      } else {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (project) {
          existingTask.project = project;
        }
      }
    }

    await this.taskRepository.save(existingTask);

    const updatedTask = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'assignedTo', 'tags', 'subtasks', 'parentTask', 'project'],
    });

    if (!updatedTask) {
      throw new NotFoundException('No se pudo actualizar la tarea');
    }

    // Invalidate caches
    await this.cacheService.del(CacheService.KEYS.TASK_DETAIL(id));
    await this.cacheService.invalidateTaskCaches();
    if (user) {
      await this.cacheService.invalidateUserCaches(user.id);
    }

    const sanitized = this.sanitizeTask(updatedTask);

    // Emit real-time event
    this.eventsGateway.emitTaskUpdated(sanitized, user?.id || 'system');

    return sanitized;
  }

  async reorderTasks(taskOrders: { id: number; position: number }[]): Promise<void> {
    for (const order of taskOrders) {
      await this.taskRepository.update(order.id, { position: order.position });
    }
    // Invalidate task list caches after reordering
    await this.cacheService.invalidateTaskCaches();
  }

  async findOneEntity(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }
    return task;
  }

  async deleteTask(id: number) {
    const task = await this.findOneEntity(id);
    const userId = task.user?.id;

    await this.taskRepository.remove(task);

    // Invalidate caches
    await this.cacheService.del(CacheService.KEYS.TASK_DETAIL(id));
    await this.cacheService.invalidateTaskCaches();
    if (userId) {
      await this.cacheService.invalidateUserCaches(userId);
    }

    // Emit real-time event
    this.eventsGateway.emitTaskDeleted(id, userId || 'system');

    return {
      message: 'Task borrado exitosamente',
    };
  }

  private sanitizeTask(task: Task) {
    const sanitizedTask: any = { ...task };

    if (sanitizedTask.user) {
      delete sanitizedTask.user.password;
    }
    if (sanitizedTask.assignedTo) {
      delete sanitizedTask.assignedTo.password;
    }

    const { user, ...taskData } = sanitizedTask;
    const response: any = {
      ...taskData,
      created_by: user?.email,
      user_id: user?.id,
    };

    if (sanitizedTask.assignedTo) {
      response.assignedTo = {
        id: sanitizedTask.assignedTo.id,
        email: sanitizedTask.assignedTo.email,
      };
    }

    if (sanitizedTask.tags) {
      response.tags = sanitizedTask.tags.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      }));
    }

    if (sanitizedTask.subtasks && sanitizedTask.subtasks.length > 0) {
      response.subtasks = sanitizedTask.subtasks.map((subtask: Task) => ({
        id: subtask.id,
        title: subtask.title,
        completed: subtask.completed,
        priority: subtask.priority,
        dueDate: subtask.dueDate,
      }));
    }

    if (sanitizedTask.parentTask) {
      response.parentTaskId = sanitizedTask.parentTask.id;
    }

    if (sanitizedTask.project) {
      response.projectId = sanitizedTask.project.id;
      response.project = {
        id: sanitizedTask.project.id,
        name: sanitizedTask.project.name,
        color: sanitizedTask.project.color,
      };
    }

    return response;
  }
}
