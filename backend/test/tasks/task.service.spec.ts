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
      const dto = { title: 'New task', description: 'Some description' };
      const user = new User();
      user.id = 'user-123';

      const createdTask = { ...dto, id: 1, user };
      mockTaskRepository.create.mockReturnValue(createdTask);
      mockTaskRepository.save.mockResolvedValue(createdTask);

      const result = await taskService.createTask(dto, user);

      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...dto,
        user,
      });
      expect(mockTaskRepository.save).toHaveBeenCalledWith(createdTask);
      expect(result.data.id).toBe(1);
      expect(result.data.created_by).toBe('user-123');
    });
  });

  describe('findAll', () => {
    it('debe retornar un array de tareas', async () => {
      mockTaskRepository.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const result = await taskService.findAll();
      expect(mockTaskRepository.find).toHaveBeenCalled();
      expect(result.length).toBe(2);
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
      jest.spyOn(taskService, 'findOne').mockResolvedValueOnce({
        id: 1,
        title: 'Old title',
        description: 'Old desc',
        completed: false,
        user: { id: 'user-123' },
      } as any);

      mockTaskRepository.save.mockImplementation((task) =>
        Promise.resolve(task),
      );

      const result = await taskService.updateTask(
        1,
        'New Title',
        'New Desc',
        true,
      );
      expect(taskService.findOne).toHaveBeenCalledWith(1);
      expect(mockTaskRepository.save).toHaveBeenCalledWith({
        id: 1,
        title: 'New Title',
        description: 'New Desc',
        completed: true,
        user: { id: 'user-123' },
      });
      expect(result.title).toBe('New Title');
      expect(result.completed).toBe(true);
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
