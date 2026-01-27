import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Task } from 'src/tasks/task.entity';

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  COMMENT_ADDED = 'comment_added',
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  MENTION = 'mention',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ default: false })
  read: boolean;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Task, { nullable: true, onDelete: 'CASCADE' })
  task: Task;

  @Column({ nullable: true })
  actorId: string;

  @CreateDateColumn()
  createdAt: Date;
}
