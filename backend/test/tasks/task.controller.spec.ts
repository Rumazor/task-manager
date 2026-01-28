import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from 'src/tasks/dto/update-dto';
import { TaskFilterDto } from 'src/tasks/dto/task-filter.dto';
import { TaskController } from 'src/tasks/task.controller';
import { TaskService } from 'src/tasks/task.service';
import { User } from 'src/users/user.entity';

describe('TaskController', () => {
  let taskController: TaskController;
  let taskService: TaskService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  } as unknown as User;

  const mockTaskService = {
    createTask: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    taskController = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('debe llamar a taskService.createTask con los argumentos correctos', async () => {
      const dto: CreateTaskDto = { title: 'test', description: 'desc' };
      const mockResult = {
        id: 1,
        created_by: mockUser.id,
        title: dto.title,
        description: dto.description,
        completed: false,
        created_at: new Date(),
      };
      mockTaskService.createTask.mockResolvedValue(mockResult);

      const result = await taskController.createTask(dto, mockUser);

      expect(taskService.createTask).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toBe(mockResult);
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las tareas con filtros', async () => {
      const mockTasks = [{ id: 1 }, { id: 2 }];
      const filters: TaskFilterDto = {};
      mockTaskService.findAll.mockResolvedValue(mockTasks);

      const result = await taskController.findAll(filters);

      expect(taskService.findAll).toHaveBeenCalledWith(filters);
      expect(result).toBe(mockTasks);
    });

    it('debe filtrar por estado completado', async () => {
      const mockTasks = [{ id: 1, completed: true }];
      const filters: TaskFilterDto = { completed: true };
      mockTaskService.findAll.mockResolvedValue(mockTasks);

      const result = await taskController.findAll(filters);

      expect(taskService.findAll).toHaveBeenCalledWith(filters);
      expect(result).toBe(mockTasks);
    });
  });

  describe('findOne', () => {
    it('debe retornar la tarea encontrada por su ID', async () => {
      const mockTask = { id: 1, title: 'Task 1' };
      mockTaskService.findOne.mockResolvedValue(mockTask);

      const result = await taskController.findOne(1);

      expect(taskService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockTask);
    });
  });

  describe('updateTask', () => {
    it('debe actualizar la tarea y retornar la tarea actualizada', async () => {
      const dto: UpdateTaskDto = {
        title: 'Updated',
        description: 'Updated description',
        completed: true,
      };

      const mockUpdatedTask = {
        id: 1,
        title: 'Updated',
        description: 'Updated description',
        completed: true,
      };

      mockTaskService.updateTask.mockResolvedValue(mockUpdatedTask);

      const result = await taskController.updateTask(1, dto, mockUser);

      expect(taskService.updateTask).toHaveBeenCalledWith(1, dto, mockUser);
      expect(result).toBeDefined();
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteTask', () => {
    it('debe eliminar la tarea y retornar mensaje de éxito', async () => {
      const mockResult = { message: 'Task borrado exitosamente' };
      mockTaskService.deleteTask.mockResolvedValue(mockResult);

      const result = await taskController.deleteTask(1);

      expect(taskService.deleteTask).toHaveBeenCalledWith(1);
      expect(result).toBe(mockResult);
    });
  });
});
