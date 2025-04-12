import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './task.entity';
import { User } from 'src/users/user.entity';
import { CreateTaskDto, TaskCreatedResponseDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/find-one.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<TaskCreatedResponseDto> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user,
    });

    await this.taskRepository.save(task);

    const { user: _, ...response } = task;

    return {
      message: 'Task creado correctamente',
      data: {
        id: response.id,
        created_by: user.id,
        title: response.title,
        description: response.description,
        completed: response.completed,
        created_at: response.created_at,
      },
    };
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async findOne(id: number): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const { user, ...taskWithoutUser } = task;
    const response: TaskResponseDto = {
      ...taskWithoutUser,
      user: {
        id: user.id,
        email: user.email,
      },
    };

    return response;
  }

  async updateTask(
    id: number,
    title: string | undefined,
    description: string | undefined,
    completed: boolean
  ): Promise<Task> {
    const task = await this.findOne(id);

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    return this.taskRepository.save(task);
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
}
