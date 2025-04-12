import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TaskService } from 'src/tasks/task.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    readonly reflector: Reflector,
    private readonly taskService: TaskService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { id } = request.params;

    const task = await this.taskService.findOneEntity(+id);
    if (task.user.id !== user.id) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta tarea',
      );
    }

    request.task = task;
    return true;
  }
}
