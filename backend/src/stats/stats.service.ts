import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Task } from 'src/tasks/task.entity';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async getOverview(user: User) {
    const totalTasks = await this.taskRepository.count({
      where: { user: { id: user.id } },
    });

    const completedTasks = await this.taskRepository.count({
      where: { user: { id: user.id }, completed: true },
    });

    const pendingTasks = totalTasks - completedTasks;

    const overdueTasks = await this.taskRepository.count({
      where: {
        user: { id: user.id },
        completed: false,
        dueDate: LessThanOrEqual(new Date()),
      },
    });

    const totalProjects = await this.projectRepository.count({
      where: { owner: { id: user.id } },
    });

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalProjects,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }

  async getByPriority(user: User) {
    const priorities = ['low', 'medium', 'high'] as const;
    const stats: { priority: string; total: number; completed: number; pending: number }[] = [];

    for (const priority of priorities) {
      const total = await this.taskRepository.count({
        where: { user: { id: user.id }, priority },
      });

      const completed = await this.taskRepository.count({
        where: { user: { id: user.id }, priority, completed: true },
      });

      stats.push({
        priority,
        total,
        completed,
        pending: total - completed,
      });
    }

    return stats;
  }

  async getByProject(user: User) {
    const projects = await this.projectRepository.find({
      where: { owner: { id: user.id } },
      relations: ['tasks'],
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      color: project.color,
      total: project.tasks?.length || 0,
      completed: project.tasks?.filter((t) => t.completed).length || 0,
      pending: project.tasks?.filter((t) => !t.completed).length || 0,
    }));
  }

  async getWeeklyStats(user: User) {
    const weeks: { week: string; startDate: string; endDate: string; created: number; completed: number }[] = [];
    const today = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7 + today.getDay()));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const created = await this.taskRepository.count({
        where: {
          user: { id: user.id },
          created_at: Between(weekStart, weekEnd),
        },
      });

      const completed = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId: user.id })
        .andWhere('task.completed = :completed', { completed: true })
        .andWhere('task.created_at BETWEEN :start AND :end', {
          start: weekStart,
          end: weekEnd,
        })
        .getCount();

      weeks.push({
        week: `Semana ${4 - i}`,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        created,
        completed,
      });
    }

    return weeks;
  }

  async getTasksForCalendar(user: User, startDate: Date, endDate: Date) {
    const tasks = await this.taskRepository.find({
      where: {
        user: { id: user.id },
        dueDate: Between(startDate, endDate),
      },
      relations: ['tags', 'project'],
      order: { dueDate: 'ASC' },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: task.dueDate,
      end: task.dueDate,
      completed: task.completed,
      priority: task.priority,
      project: task.project
        ? { id: task.project.id, name: task.project.name, color: task.project.color }
        : null,
      tags: task.tags?.map((t) => ({ id: t.id, name: t.name, color: t.color })),
    }));
  }
}
