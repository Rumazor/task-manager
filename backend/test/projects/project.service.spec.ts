import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProjectService } from 'src/projects/project.service';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';

describe('ProjectService', () => {
  let projectService: ProjectService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    tasks: [],
  } as unknown as User;

  const mockProjectRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear y guardar un nuevo proyecto', async () => {
      const createProjectDto = {
        name: 'Proyecto Test',
        description: 'Descripción del proyecto',
        color: '#FF5733',
      };

      const createdProject = {
        id: 1,
        ...createProjectDto,
        owner: mockUser,
        tasks: [],
        createdAt: new Date(),
      };

      mockProjectRepository.create.mockReturnValue(createdProject);
      mockProjectRepository.save.mockResolvedValue(createdProject);

      const result = await projectService.create(createProjectDto, mockUser);

      expect(mockProjectRepository.create).toHaveBeenCalledWith({
        ...createProjectDto,
        owner: mockUser,
      });
      expect(mockProjectRepository.save).toHaveBeenCalledWith(createdProject);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Proyecto Test');
    });
  });

  describe('findAll', () => {
    it('debe retornar un array de proyectos con estadísticas', async () => {
      const mockProjects = [
        {
          id: 1,
          name: 'Proyecto 1',
          description: 'Descripción 1',
          color: '#FF5733',
          createdAt: new Date(),
          tasks: [
            { id: 1, completed: true },
            { id: 2, completed: false },
          ],
        },
        {
          id: 2,
          name: 'Proyecto 2',
          description: 'Descripción 2',
          color: '#33FF57',
          createdAt: new Date(),
          tasks: [],
        },
      ];

      mockProjectRepository.find.mockResolvedValue(mockProjects);

      const result = await projectService.findAll(mockUser);

      expect(result.length).toBe(2);
      expect(result[0].taskCount).toBe(2);
      expect(result[0].completedTaskCount).toBe(1);
      expect(result[1].taskCount).toBe(0);
    });
  });

  describe('findOne', () => {
    it('debe retornar un proyecto si existe', async () => {
      const mockProject = {
        id: 1,
        name: 'Proyecto Test',
        owner: mockUser,
        tasks: [],
      };

      mockProjectRepository.findOne.mockResolvedValue(mockProject);

      const result = await projectService.findOne(1, mockUser);

      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, owner: { id: mockUser.id } },
        relations: ['tasks', 'tasks.tags', 'tasks.assignedTo', 'tasks.user'],
      });
      expect(result.id).toBe(1);
    });

    it('debe lanzar NotFoundException si el proyecto no existe', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(projectService.findOne(999, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneWithStats', () => {
    it('debe retornar proyecto con estadísticas', async () => {
      const mockProject = {
        id: 1,
        name: 'Proyecto Test',
        tasks: [
          { id: 1, completed: true, priority: 'high' },
          { id: 2, completed: false, priority: 'medium' },
          { id: 3, completed: false, priority: 'low' },
        ],
      };

      mockProjectRepository.findOne.mockResolvedValue(mockProject);

      const result = await projectService.findOneWithStats(1, mockUser);

      expect(result.stats.total).toBe(3);
      expect(result.stats.completed).toBe(1);
      expect(result.stats.todo).toBe(2);
      expect(result.stats.byPriority.high).toBe(1);
      expect(result.stats.byPriority.medium).toBe(1);
      expect(result.stats.byPriority.low).toBe(1);
    });
  });

  describe('update', () => {
    it('debe actualizar el proyecto existente', async () => {
      const updateDto = { name: 'Proyecto Actualizado' };
      const existingProject = {
        id: 1,
        name: 'Proyecto Original',
        tasks: [],
      };
      const updatedProject = { ...existingProject, ...updateDto };

      mockProjectRepository.findOne.mockResolvedValue(existingProject);
      mockProjectRepository.save.mockResolvedValue(updatedProject);

      const result = await projectService.update(1, updateDto, mockUser);

      expect(mockProjectRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Proyecto Actualizado');
    });
  });

  describe('remove', () => {
    it('debe eliminar el proyecto especificado', async () => {
      const mockProject = { id: 1, name: 'Proyecto a eliminar' };

      mockProjectRepository.findOne.mockResolvedValue(mockProject);
      mockProjectRepository.remove.mockResolvedValue(mockProject);

      await projectService.remove(1, mockUser);

      expect(mockProjectRepository.remove).toHaveBeenCalledWith(mockProject);
    });

    it('debe lanzar NotFoundException si el proyecto no existe', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(projectService.remove(999, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTasksByStatus', () => {
    it('debe retornar tareas agrupadas por estado', async () => {
      const mockProject = {
        id: 1,
        tasks: [
          { id: 1, completed: false, position: 1, user: { email: 'test@example.com' } },
          { id: 2, completed: true, position: 2, user: { email: 'test@example.com' } },
          { id: 3, completed: false, position: 0, user: { email: 'test@example.com' } },
        ],
      };

      mockProjectRepository.findOne.mockResolvedValue(mockProject);

      const result = await projectService.getTasksByStatus(1, mockUser);

      expect(result.todo.length).toBe(2);
      expect(result.completed.length).toBe(1);
      expect(result.todo[0].id).toBe(3);
    });
  });
});
