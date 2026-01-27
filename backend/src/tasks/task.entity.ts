import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Tag } from 'src/tags/tag.entity';
import { Project } from 'src/projects/project.entity';
import { Comment } from 'src/comments/comment.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  @Column({ default: 0 })
  position: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.tasks, { eager: false })
  user: User;

  @ManyToOne(() => User, (user) => user.assigned_tasks, {
    eager: false,
    nullable: true,
  })
  assignedTo: User;

  @ManyToMany(() => Tag, (tag) => tag.tasks, { eager: true })
  @JoinTable({ name: 'task_tags' })
  tags: Tag[];

  @ManyToOne(() => Task, (task) => task.subtasks, { nullable: true })
  parentTask: Task | null;

  @OneToMany(() => Task, (task) => task.parentTask)
  subtasks: Task[];

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: true })
  project: Project | null;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}
