import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from 'src/users/user.entity';
import { NotFoundException } from '@nestjs/common';
import { TaskService } from 'src/tasks/task.service';
import { Task } from 'src/tasks/task.entity';

describe('TaskService', () => {
  let taskService: TaskService;

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
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
      const mockUser: User = {
        id: '',
        email: 'user-123',
        password: 'hashedpassword',
        createdAt: new Date(),
        tasks: [],
        checkFieldsBeforeInser: jest.fn(),
        checkFieldsBeforeUpdate: jest.fn(),
      };

      const createTaskDto = {
        title: 'Nueva tarea',
        description: 'Descripción',
      };

      const createdTask = {
        id: 1,
        ...createTaskDto,
        user: mockUser,
        completed: false,
        created_at: new Date(),
      };

      mockTaskRepository.create.mockReturnValue(createdTask);
      mockTaskRepository.save.mockResolvedValue(createdTask);

      const result = await taskService.createTask(createTaskDto, mockUser);

      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        user: mockUser,
      });
      expect(mockTaskRepository.save).toHaveBeenCalledWith(createdTask);
      expect(result.data.id).toBe(1);
      expect(result.data.created_by).toBe('user-123');
    });
  });

  describe('findAll', () => {
    it('debe retornar un array de tareas', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Tarea 1',
          description: 'Descripción 1',
          completed: false,
          created_at: new Date(),
          user: { id: 1, email: 'user1@example.com' },
        },
        {
          id: 2,
          title: 'Tarea 2',
          description: 'Descripción 2',
          completed: true,
          created_at: new Date(),
          user: { id: 2, email: 'user2@example.com' },
        },
      ];

      mockTaskRepository.find.mockResolvedValue(mockTasks);

      const result = await taskService.findAll();

      expect(result.length).toBe(2);
      expect(result[0].created_by).toBe('user1@example.com');
      expect(result[1].created_by).toBe('user2@example.com');
    });
  });

  describe('findOne', () => {
    it('debe retornar una tarea si existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue({
        id: 1,
        title: 'Test Task',
        user: { id: 'user-123', email: 'test@example.com' },
      });

      const result = await taskService.findOne(1);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(result.id).toBe(1);
    });

    it('debe lanzar NotFoundException si la tarea no existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(taskService.findOne(123)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTask', () => {
    it('debe actualizar la tarea existente', async () => {
      const taskId = 1;
      const newTitle = 'Título actualizado';
      const newDescription = 'Descripción actualizada';
      const completed = true;

      const existingTask = {
        id: taskId,
        title: 'Título anterior',
        description: 'Descripción anterior',
        completed: false,
        created_at: new Date(),
        user: { id: 1, email: 'user@example.com' },
      };

      const updatedTask = {
        ...existingTask,
        title: newTitle,
        description: newDescription,
        completed: completed,
      };

      mockTaskRepository.findOne.mockResolvedValueOnce(existingTask);
      mockTaskRepository.save.mockResolvedValue(updatedTask);
      mockTaskRepository.findOne.mockResolvedValueOnce(updatedTask);

      const result = await taskService.updateTask(
        taskId,
        newTitle,
        newDescription,
        completed,
      );

      expect(mockTaskRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockTaskRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: taskId,
          title: newTitle,
          description: newDescription,
          completed: completed,
        }),
      );
      expect(result.title).toBe(newTitle);
      expect(result.created_by).toBe('user@example.com');
    });
  });

  describe('deleteTask', () => {
    it('debe eliminar la tarea especificada', async () => {
      jest
        .spyOn(taskService, 'findOneEntity')
        .mockResolvedValueOnce({ id: 1 } as any);
      mockTaskRepository.remove.mockResolvedValueOnce(true as any);

      const result = await taskService.deleteTask(1);
      expect(taskService.findOneEntity).toHaveBeenCalledWith(1);
      expect(mockTaskRepository.remove).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ message: 'Task borrado exitosamente' });
    });
  });
});
