import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { User } from 'src/users/user.entity';
import { Task } from 'src/tasks/task.entity';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const user = await this.userRepository.findOne({
      where: { id: createNotificationDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createNotificationDto.userId} not found`);
    }

    const notification = this.notificationRepository.create({
      type: createNotificationDto.type,
      message: createNotificationDto.message,
      user,
      actorId: createNotificationDto.actorId,
    });

    if (createNotificationDto.taskId) {
      const task = await this.taskRepository.findOne({
        where: { id: createNotificationDto.taskId },
      });
      if (task) {
        notification.task = task;
      }
    }

    return this.notificationRepository.save(notification);
  }

  async createTaskAssignedNotification(
    task: Task,
    assignedUser: User,
    assignedBy: User,
  ): Promise<Notification> {
    return this.create({
      type: NotificationType.TASK_ASSIGNED,
      message: `${assignedBy.email} te ha asignado la tarea "${task.title}"`,
      userId: assignedUser.id,
      taskId: task.id,
      actorId: assignedBy.id,
    });
  }

  async createCommentNotification(
    task: Task,
    taskOwner: User,
    commenter: User,
  ): Promise<Notification | null> {
    if (taskOwner.id === commenter.id) return null;

    return this.create({
      type: NotificationType.COMMENT_ADDED,
      message: `${commenter.email} ha comentado en tu tarea "${task.title}"`,
      userId: taskOwner.id,
      taskId: task.id,
      actorId: commenter.id,
    });
  }

  async findAllForUser(user: User): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: user.id } },
      relations: ['task'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findUnreadForUser(user: User): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: user.id }, read: false },
      relations: ['task'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(user: User): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: user.id }, read: false },
    });
  }

  async markAsRead(id: number, user: User): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    notification.read = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(user: User): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: user.id }, read: false },
      { read: true },
    );
  }

  async delete(id: number, user: User): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.notificationRepository.remove(notification);
  }

  sanitizeNotification(notification: Notification) {
    return {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      task: notification.task
        ? { id: notification.task.id, title: notification.task.title }
        : null,
      createdAt: notification.createdAt,
    };
  }
}
