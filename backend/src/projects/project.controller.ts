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
import { ProjectService } from './project.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectResponseDto,
} from './dto/create-project.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('projects')
@ApiTags('Projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created', type: ProjectResponseDto })
  async create(@Body() createProjectDto: CreateProjectDto, @GetUser() user: User) {
    return this.projectService.create(createProjectDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for current user' })
  @ApiResponse({ status: 200, description: 'List of projects', type: [ProjectResponseDto] })
  async findAll(@GetUser() user: User) {
    return this.projectService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID with stats' })
  @ApiResponse({ status: 200, description: 'Project found' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.projectService.findOneWithStats(id, user);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get project tasks grouped by status' })
  @ApiResponse({ status: 200, description: 'Tasks grouped by status' })
  async getTasksByStatus(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.projectService.getTasksByStatus(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() user: User,
  ) {
    return this.projectService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    await this.projectService.remove(id, user);
    return { message: 'Project deleted successfully' };
  }
}
