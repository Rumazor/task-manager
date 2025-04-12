// tasks/task.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskService } from './task.service';
import { UsersModule } from 'src/users/user.module';
import { TaskController } from './task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), UsersModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TasksModule {}
