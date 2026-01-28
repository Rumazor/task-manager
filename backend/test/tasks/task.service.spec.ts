import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

import { TaskService } from 'src/tasks/task.service';
import { Task } from 'src/tasks/task.entity';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';
import { UserService } from 'src/users/user.service';
import { TagService } from 'src/tags/tag.service';
import { CacheService } from 'src/cache/cache.service';
import { EventsGateway } from 'src/websockets/events.gateway';

describe('TaskService', () => {
  let taskService: TaskService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    tasks: [],
  } as unknown as User;

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProjectRepository = {
    findOne: jest.fn(),
  };

  const mockUserService = {
    findOneByUuid: jest.fn(),
  };

  const mockTagService = {
    findByIds: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    invalidateTaskCaches: jest.fn(),
    invalidateUserCaches: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockEventsGateway = {
    emitTaskCreated: jest.fn(),
    emitTaskUpdated: jest.fn(),
    emitTaskDeleted: jest.fn(),
    sendNotificationToUser: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TagService,
          useValue: mockTagService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('debe crear y guardar una nueva tarea', async () => {
      const createTaskDto = {
        title: 'Nueva tarea',
        description: 'Descripción',
      };

      const createdTask = {
        id: 1,
        title: createTaskDto.title,
        description: createTaskDto.description,
        user: mockUser,
        completed: false,
        created_at: new Date(),
        tags: [],
      };

      mockTaskRepository.create.mockReturnValue(createdTask);
      mockTaskRepository.save.mockResolvedValue(createdTask);

      const result = await taskService.createTask(createTaskDto, mockUser);

      expect(mockTaskRepository.create).toHaveBeenCalled();
      expect(mockTaskRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debe crear tarea con usuario asignado', async () => {
      const assignedUser = {
        id: 'user-456',
        email: 'assigned@example.com',
      } as unknown as User;

      const createTaskDto = {
        title: 'Tarea asignada',
        description: 'Descripción de tarea asignada',
        assignedToId: 'user-456',
      };

      const createdTask = {
        id: 2,
        title: createTaskDto.title,
        user: mockUser,
        assignedTo: assignedUser,
        completed: false,
        created_at: new Date(),
        tags: [],
      };

      mockUserService.findOneByUuid.mockResolvedValue(assignedUser);
      mockTaskRepository.create.mockReturnValue(createdTask);
      mockTaskRepository.save.mockResolvedValue(createdTask);

      const result = await taskService.createTask(createTaskDto, mockUser);

      expect(mockUserService.findOneByUuid).toHaveBeenCalledWith('user-456');
      expect(result).toBeDefined();
      expect(mockEventsGateway.sendNotificationToUser).toHaveBeenCalled();
    });

    it('debe lanzar error si usuario asignado no existe', async () => {
      const createTaskDto = {
        title: 'Tarea',
        description: 'Descripción',
        assignedToId: 'nonexistent',
      };

      mockUserService.findOneByUuid.mockResolvedValue(null);

      await expect(
        taskService.createTask(createTaskDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneEntity', () => {
    it('debe retornar una tarea si existe', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        user: mockUser,
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await taskService.findOneEntity(1);

      expect(mockTaskRepository.findOne).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('debe lanzar NotFoundException si la tarea no existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(taskService.findOneEntity(123)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTask', () => {
    it('debe actualizar la tarea existente', async () => {
      const taskId = 1;
      const updateDto = {
        title: 'Título actualizado',
        description: 'Descripción actualizada',
        completed: true,
      };

      const existingTask = {
        id: taskId,
        title: 'Título anterior',
        description: 'Descripción anterior',
        completed: false,
        created_at: new Date(),
        user: mockUser,
        tags: [],
      };

      const updatedTask = {
        ...existingTask,
        ...updateDto,
      };

      mockTaskRepository.findOne.mockResolvedValue(existingTask);
      mockTaskRepository.save.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(taskId, updateDto);

      expect(mockTaskRepository.findOne).toHaveBeenCalled();
      expect(mockTaskRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Título actualizado');
      expect(result.completed).toBe(true);
    });

    it('debe lanzar NotFoundException si la tarea no existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(
        taskService.updateTask(999, { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTask', () => {
    it('debe eliminar la tarea especificada', async () => {
      const mockTask = { id: 1, title: 'Tarea a eliminar' };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.remove.mockResolvedValue(mockTask);

      const result = await taskService.deleteTask(1);

      expect(mockTaskRepository.remove).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual({ message: 'Task borrado exitosamente' });
    });
  });
});
