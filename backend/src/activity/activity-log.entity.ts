import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Task } from 'src/tasks/task.entity';
import { Project } from 'src/projects/project.entity';

export enum ActivityAction {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  TASK_COMPLETED = 'task_completed',
  TASK_ASSIGNED = 'task_assigned',
  COMMENT_ADDED = 'comment_added',
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
}

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, any>;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Task, { nullable: true, onDelete: 'SET NULL' })
  task: Task;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  project: Project;

  @CreateDateColumn()
  createdAt: Date;
}
