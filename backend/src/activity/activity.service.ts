import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityAction } from './activity-log.entity';
import { User } from 'src/users/user.entity';
import { Task } from 'src/tasks/task.entity';
import { Project } from 'src/projects/project.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityRepository: Repository<ActivityLog>,
  ) {}

  async log(
    action: ActivityAction,
    user: User,
    options?: {
      task?: Task;
      project?: Project;
      changes?: Record<string, any>;
      description?: string;
    },
  ): Promise<ActivityLog> {
    const activity = this.activityRepository.create({
      action,
      user,
      task: options?.task,
      project: options?.project,
      changes: options?.changes,
      description: options?.description,
    });

    return this.activityRepository.save(activity);
  }

  async logTaskCreated(task: Task, user: User): Promise<ActivityLog> {
    return this.log(ActivityAction.TASK_CREATED, user, {
      task,
      description: `Creo la tarea "${task.title}"`,
    });
  }

  async logTaskUpdated(
    task: Task,
    user: User,
    changes: Record<string, any>,
  ): Promise<ActivityLog> {
    return this.log(ActivityAction.TASK_UPDATED, user, {
      task,
      changes,
      description: `Actualizo la tarea "${task.title}"`,
    });
  }

  async logTaskCompleted(task: Task, user: User): Promise<ActivityLog> {
    return this.log(ActivityAction.TASK_COMPLETED, user, {
      task,
      description: `Completo la tarea "${task.title}"`,
    });
  }

  async logTaskAssigned(
    task: Task,
    assignedTo: User,
    assignedBy: User,
  ): Promise<ActivityLog> {
    return this.log(ActivityAction.TASK_ASSIGNED, assignedBy, {
      task,
      changes: { assignedTo: assignedTo.email },
      description: `Asigno la tarea "${task.title}" a ${assignedTo.email}`,
    });
  }

  async logCommentAdded(task: Task, user: User): Promise<ActivityLog> {
    return this.log(ActivityAction.COMMENT_ADDED, user, {
      task,
      description: `Comento en la tarea "${task.title}"`,
    });
  }

  async findByTask(taskId: number): Promise<ActivityLog[]> {
    return this.activityRepository.find({
      where: { task: { id: taskId } },
      relations: ['user', 'task'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findByProject(projectId: number): Promise<ActivityLog[]> {
    return this.activityRepository.find({
      where: { project: { id: projectId } },
      relations: ['user', 'task', 'project'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findByUser(userId: string): Promise<ActivityLog[]> {
    return this.activityRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'task', 'project'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findRecent(limit: number = 20): Promise<ActivityLog[]> {
    return this.activityRepository.find({
      relations: ['user', 'task', 'project'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  sanitizeActivity(activity: ActivityLog) {
    return {
      id: activity.id,
      action: activity.action,
      description: activity.description,
      changes: activity.changes,
      user: activity.user
        ? { id: activity.user.id, email: activity.user.email }
        : null,
      task: activity.task
        ? { id: activity.task.id, title: activity.task.title }
        : null,
      project: activity.project
        ? { id: activity.project.id, name: activity.project.name }
        : null,
      createdAt: activity.createdAt,
    };
  }
}
