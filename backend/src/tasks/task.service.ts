import { Injectable, NotFoundException } from '@nestjs/common';
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
        created_by: user.email,
        title: response.title,
        description: response.description,
        completed: response.completed,
        created_at: response.created_at,
        user_id: user.id,
      },
    };
  }

  async findAll(): Promise<any[]> {
    const tasks = await this.taskRepository.find({
      relations: ['user'],
    });

    return tasks.map((task) => {
      const { user, ...taskData } = task;
      return {
        ...taskData,
        created_by: user.email,
        user_id: user.id,
      };
    });
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
    completed: boolean,
  ): Promise<any> {
    const existingTask = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!existingTask) {
      throw new NotFoundException('Tarea no encontrada');
    }

    if (title !== undefined) existingTask.title = title;
    if (description !== undefined) existingTask.description = description;
    if (completed !== undefined) existingTask.completed = completed;

    await this.taskRepository.save(existingTask);

    const updatedTask = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!updatedTask || !updatedTask.user) {
      throw new NotFoundException('No se pudo actualizar la tarea');
    }

    const { user, ...taskData } = updatedTask;

    return {
      ...taskData,
      created_by: user.email,
      user_id: user.id,
    };
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
