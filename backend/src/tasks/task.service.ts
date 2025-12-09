import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './task.entity';
import { User } from 'src/users/user.entity';
import { CreateTaskDto, TaskCreatedResponseDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-dto';
import { TaskResponseDto } from './dto/find-one.dto';
import { UserService } from 'src/users/user.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private readonly userService: UserService,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<TaskCreatedResponseDto> {
    const { assignedToId, ...rest } = createTaskDto;
    const task = this.taskRepository.create({
      ...rest,
      user,
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

    await this.taskRepository.save(task);

    const responseData: any = {
      id: task.id,
      created_by: user.email,
      title: task.title,
      description: task.description,
      completed: task.completed,
      created_at: task.created_at,
      user_id: user.id,
    };

    if (task.assignedTo) {
      responseData.assignedTo = {
        id: task.assignedTo.id,
        email: task.assignedTo.email,
      };
    }

    return {
      message: 'Task creado correctamente',
      data: responseData,
    };
  }

  async findAll(): Promise<any[]> {
    const tasks = await this.taskRepository.find({
      relations: ['user', 'assignedTo'],
    });

    return tasks.map((task) => this.sanitizeTask(task));
  }
  async findOne(id: number): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'assignedTo'],
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return this.sanitizeTask(task) as TaskResponseDto;
  }

  async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<any> {
    const existingTask = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!existingTask) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const { assignedToId, ...rest } = updateTaskDto;
    Object.assign(existingTask, rest);

    if (assignedToId) {
      const assignedUser = await this.userService.findOneByUuid(assignedToId);
      if (!assignedUser) {
        throw new NotFoundException(
          `Usuario asignado con UUID ${assignedToId} no encontrado`,
        );
      }
      existingTask.assignedTo = assignedUser;
    }

    await this.taskRepository.save(existingTask);

    const updatedTask = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'assignedTo'],
    });

    if (!updatedTask) {
      throw new NotFoundException('No se pudo actualizar la tarea');
    }

    return this.sanitizeTask(updatedTask);
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

    await this.taskRepository.remove(task);
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
    const response = {
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

    return response;
  }
}
