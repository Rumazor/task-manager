import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('stats')
@ApiTags('Stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overall statistics' })
  @ApiResponse({ status: 200, description: 'Overview statistics' })
  async getOverview(@GetUser() user: User) {
    return this.statsService.getOverview(user);
  }

  @Get('by-priority')
  @ApiOperation({ summary: 'Get statistics by priority' })
  @ApiResponse({ status: 200, description: 'Statistics by priority' })
  async getByPriority(@GetUser() user: User) {
    return this.statsService.getByPriority(user);
  }

  @Get('by-project')
  @ApiOperation({ summary: 'Get statistics by project' })
  @ApiResponse({ status: 200, description: 'Statistics by project' })
  async getByProject(@GetUser() user: User) {
    return this.statsService.getByProject(user);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly statistics (last 4 weeks)' })
  @ApiResponse({ status: 200, description: 'Weekly statistics' })
  async getWeeklyStats(@GetUser() user: User) {
    return this.statsService.getWeeklyStats(user);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get tasks for calendar view' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Calendar tasks' })
  async getCalendarTasks(
    @GetUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getTasksForCalendar(
      user,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
