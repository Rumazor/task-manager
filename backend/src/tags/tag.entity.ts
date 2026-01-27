import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Task } from 'src/tasks/task.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '#3B82F6' })
  color: string;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @ManyToMany(() => Task, (task) => task.tags)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;
}
