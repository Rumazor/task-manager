import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Task } from 'src/tasks/task.entity';
import { User } from 'src/users/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    const task = await this.taskRepository.findOne({
      where: { id: createCommentDto.taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${createCommentDto.taskId} not found`);
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      author: user,
      task,
    });

    return this.commentRepository.save(comment);
  }

  async findByTask(taskId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { task: { id: taskId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'task'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateCommentDto.content;
    return this.commentRepository.save(comment);
  }

  async remove(id: number, user: User): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
  }

  sanitizeComment(comment: Comment) {
    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        email: comment.author.email,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
