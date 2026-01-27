import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('activity')
@ApiTags('Activity')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of recent activity' })
  async findRecent(@Query('limit') limit?: number) {
    const activities = await this.activityService.findRecent(limit || 20);
    return activities.map((a) => this.activityService.sanitizeActivity(a));
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get activity for a specific task' })
  @ApiResponse({ status: 200, description: 'List of task activity' })
  async findByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    const activities = await this.activityService.findByTask(taskId);
    return activities.map((a) => this.activityService.sanitizeActivity(a));
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get activity for a specific project' })
  @ApiResponse({ status: 200, description: 'List of project activity' })
  async findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    const activities = await this.activityService.findByProject(projectId);
    return activities.map((a) => this.activityService.sanitizeActivity(a));
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user activity' })
  @ApiResponse({ status: 200, description: 'List of user activity' })
  async findMyActivity(@GetUser() user: User) {
    const activities = await this.activityService.findByUser(user.id);
    return activities.map((a) => this.activityService.sanitizeActivity(a));
  }
}
