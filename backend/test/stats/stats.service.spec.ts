import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StatsService } from 'src/stats/stats.service';
import { Task } from 'src/tasks/task.entity';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';

describe('StatsService', () => {
  let statsService: StatsService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    tasks: [],
  } as unknown as User;

  const mockTaskRepository = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProjectRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    statsService = module.get<StatsService>(StatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('debe retornar estadísticas generales', async () => {
      mockTaskRepository.count
        .mockResolvedValueOnce(10) // totalTasks
        .mockResolvedValueOnce(6) // completedTasks
        .mockResolvedValueOnce(2); // overdueTasks

      mockProjectRepository.count.mockResolvedValue(3);

      const result = await statsService.getOverview(mockUser);

      expect(result.totalTasks).toBe(10);
      expect(result.completedTasks).toBe(6);
      expect(result.pendingTasks).toBe(4);
      expect(result.overdueTasks).toBe(2);
      expect(result.totalProjects).toBe(3);
      expect(result.completionRate).toBe(60);
    });

    it('debe retornar 0% de completado si no hay tareas', async () => {
      mockTaskRepository.count.mockResolvedValue(0);
      mockProjectRepository.count.mockResolvedValue(0);

      const result = await statsService.getOverview(mockUser);

      expect(result.completionRate).toBe(0);
    });
  });

  describe('getByPriority', () => {
    it('debe retornar estadísticas por prioridad', async () => {
      // Mock para cada prioridad (total y completed)
      mockTaskRepository.count
        .mockResolvedValueOnce(3) // low total
        .mockResolvedValueOnce(1) // low completed
        .mockResolvedValueOnce(5) // medium total
        .mockResolvedValueOnce(3) // medium completed
        .mockResolvedValueOnce(2) // high total
        .mockResolvedValueOnce(2); // high completed

      const result = await statsService.getByPriority(mockUser);

      expect(result.length).toBe(3);
      expect(result[0]).toEqual({
        priority: 'low',
        total: 3,
        completed: 1,
        pending: 2,
      });
      expect(result[1]).toEqual({
        priority: 'medium',
        total: 5,
        completed: 3,
        pending: 2,
      });
      expect(result[2]).toEqual({
        priority: 'high',
        total: 2,
        completed: 2,
        pending: 0,
      });
    });
  });

  describe('getByProject', () => {
    it('debe retornar estadísticas por proyecto', async () => {
      const mockProjects = [
        {
          id: 1,
          name: 'Proyecto A',
          color: '#FF5733',
          tasks: [
            { id: 1, completed: true },
            { id: 2, completed: false },
            { id: 3, completed: true },
          ],
        },
        {
          id: 2,
          name: 'Proyecto B',
          color: '#33FF57',
          tasks: [{ id: 4, completed: false }],
        },
      ];

      mockProjectRepository.find.mockResolvedValue(mockProjects);

      const result = await statsService.getByProject(mockUser);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Proyecto A',
        color: '#FF5733',
        total: 3,
        completed: 2,
        pending: 1,
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Proyecto B',
        color: '#33FF57',
        total: 1,
        completed: 0,
        pending: 1,
      });
    });

    it('debe manejar proyectos sin tareas', async () => {
      const mockProjects = [
        {
          id: 1,
          name: 'Proyecto vacío',
          color: '#000000',
          tasks: null,
        },
      ];

      mockProjectRepository.find.mockResolvedValue(mockProjects);

      const result = await statsService.getByProject(mockUser);

      expect(result[0].total).toBe(0);
      expect(result[0].completed).toBe(0);
      expect(result[0].pending).toBe(0);
    });
  });

  describe('getWeeklyStats', () => {
    it('debe retornar estadísticas de las últimas 4 semanas', async () => {
      mockTaskRepository.count.mockResolvedValue(2);
      mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await statsService.getWeeklyStats(mockUser);

      expect(result.length).toBe(4);
      expect(result[0]).toHaveProperty('week');
      expect(result[0]).toHaveProperty('startDate');
      expect(result[0]).toHaveProperty('endDate');
      expect(result[0]).toHaveProperty('created');
      expect(result[0]).toHaveProperty('completed');
    });
  });

  describe('getTasksForCalendar', () => {
    it('debe retornar tareas formateadas para calendario', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockTasks = [
        {
          id: 1,
          title: 'Tarea 1',
          dueDate: new Date('2024-01-15'),
          completed: false,
          priority: 'high',
          project: { id: 1, name: 'Proyecto', color: '#FF5733' },
          tags: [{ id: 1, name: 'urgente', color: '#FF0000' }],
        },
      ];

      mockTaskRepository.find.mockResolvedValue(mockTasks);

      const result = await statsService.getTasksForCalendar(
        mockUser,
        startDate,
        endDate,
      );

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
      expect(result[0].project).toEqual({
        id: 1,
        name: 'Proyecto',
        color: '#FF5733',
      });
      expect(result[0].tags[0]).toEqual({
        id: 1,
        name: 'urgente',
        color: '#FF0000',
      });
    });

    it('debe manejar tareas sin proyecto', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Tarea sin proyecto',
          dueDate: new Date(),
          completed: false,
          priority: 'low',
          project: null,
          tags: [],
        },
      ];

      mockTaskRepository.find.mockResolvedValue(mockTasks);

      const result = await statsService.getTasksForCalendar(
        mockUser,
        new Date(),
        new Date(),
      );

      expect(result[0].project).toBeNull();
    });
  });
});
