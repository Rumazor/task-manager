import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { TaskService } from './task.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UpdateTaskDto } from './dto/update-dto';
import { OwnerGuard } from 'src/common/guards/task-owner.guard';
import { CreateTaskDto, TaskCreatedResponseDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/find-one.dto';
import { TaskFilterDto } from './dto/task-filter.dto';

@Controller('tasks')
@ApiTags('Tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una tarea' })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada correctamente.',
    type: TaskCreatedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  async createTask(@Body() body: CreateTaskDto, @Req() @GetUser() user: User) {
    return this.taskService.createTask(body, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas con filtros' })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high'] })
  @ApiQuery({ name: 'tagId', required: false, type: Number })
  @ApiQuery({ name: 'dueBefore', required: false, type: String })
  @ApiQuery({ name: 'dueAfter', required: false, type: String })
  @ApiQuery({ name: 'completed', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas obtenida correctamente.',
    type: [TaskResponseDto],
  })
  async findAll(@Query() filters: TaskFilterDto) {
    return this.taskService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por su ID' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea obtenida correctamente.',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reordenar tareas' })
  @ApiResponse({ status: 200, description: 'Tareas reordenadas correctamente.' })
  async reorderTasks(@Body() taskOrders: { id: number; position: number }[]) {
    await this.taskService.reorderTasks(taskOrders);
    return { message: 'Tasks reordered successfully' };
  }

  @Patch(':id')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea actualizada correctamente.',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    const updatedTask = await this.taskService.updateTask(id, updateTaskDto, user);

    const { user: userInfo, ...task } = updatedTask;
    return task;
  }

  @Delete(':id')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea eliminada correctamente.',
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async deleteTask(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.deleteTask(id);
  }
}
