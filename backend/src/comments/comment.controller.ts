import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('comments')
@ApiTags('Comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created', type: CommentResponseDto })
  async create(@Body() createCommentDto: CreateCommentDto, @GetUser() user: User) {
    const comment = await this.commentService.create(createCommentDto, user);
    return this.commentService.sanitizeComment(comment);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get all comments for a task' })
  @ApiResponse({ status: 200, description: 'List of comments', type: [CommentResponseDto] })
  async findByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    const comments = await this.commentService.findByTask(taskId);
    return comments.map((c) => this.commentService.sanitizeComment(c));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated', type: CommentResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    const comment = await this.commentService.update(id, updateCommentDto, user);
    return this.commentService.sanitizeComment(comment);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted' })
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    await this.commentService.remove(id, user);
    return { message: 'Comment deleted successfully' };
  }
}
