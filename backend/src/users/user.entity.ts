import { Task } from 'src/tasks/task.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @BeforeInsert()
  checkFieldsBeforeInser() {
    {
      this.email = this.email.toLowerCase().trim();
    }
  }

  @BeforeInsert()
  checkFieldsBeforeUpdate() {
    {
      this.email = this.email.toLowerCase().trim();
    }
  }
}
