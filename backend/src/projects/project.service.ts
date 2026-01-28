import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { User } from 'src/users/user.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      owner: user,
    });
    return this.projectRepository.save(project);
  }

  async findAll(user: User): Promise<any[]> {
    const projects = await this.projectRepository.find({
      where: { owner: { id: user.id } },
      relations: ['tasks'],
      order: { createdAt: 'DESC' },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      createdAt: project.createdAt,
      taskCount: project.tasks?.length || 0,
      completedTaskCount: project.tasks?.filter((t) => t.completed).length || 0,
    }));
  }

  async findOne(id: number, user: User): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, owner: { id: user.id } },
      relations: ['tasks', 'tasks.tags', 'tasks.assignedTo', 'tasks.user'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async findOneWithStats(id: number, user: User): Promise<any> {
    const project = await this.findOne(id, user);

    const tasks = project.tasks || [];
    const todoTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    return {
      ...project,
      stats: {
        total: tasks.length,
        todo: todoTasks.length,
        completed: completedTasks.length,
        byPriority: {
          high: tasks.filter((t) => t.priority === 'high').length,
          medium: tasks.filter((t) => t.priority === 'medium').length,
          low: tasks.filter((t) => t.priority === 'low').length,
        },
      },
    };
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, user: User): Promise<Project> {
    const project = await this.findOne(id, user);
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: number, user: User): Promise<void> {
    const project = await this.findOne(id, user);
    await this.projectRepository.remove(project);
  }

  async getTasksByStatus(id: number, user: User): Promise<any> {
    const project = await this.findOne(id, user);

    const tasks = project.tasks || [];

    return {
      todo: tasks
        .filter((t) => !t.completed)
        .sort((a, b) => a.position - b.position)
        .map((t) => this.sanitizeTask(t)),
      completed: tasks
        .filter((t) => t.completed)
        .sort((a, b) => a.position - b.position)
        .map((t) => this.sanitizeTask(t)),
    };
  }

  private sanitizeTask(task: any) {
    const { user, ...taskData } = task;
    return {
      ...taskData,
      created_by: user?.email,
      user_id: user?.id,
      assignedTo: task.assignedTo
        ? { id: task.assignedTo.id, email: task.assignedTo.email }
        : null,
      tags: task.tags?.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })),
    };
  }
}
