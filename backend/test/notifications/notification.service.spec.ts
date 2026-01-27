import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from 'src/notifications/notification.service';
import { Notification, NotificationType } from 'src/notifications/notification.entity';
import { User } from 'src/users/user.entity';
import { Task } from 'src/tasks/task.entity';

describe('NotificationService', () => {
  let notificationService: NotificationService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    tasks: [],
  } as unknown as User;

  const mockAssigner = {
    id: 'user-456',
    email: 'assigner@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    tasks: [],
  } as unknown as User;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockTaskRepository = {
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una notificación', async () => {
      const createDto = {
        type: NotificationType.TASK_ASSIGNED,
        message: 'Te han asignado una tarea',
        userId: 'user-123',
        taskId: 1,
        actorId: 'user-456',
      };

      const mockTask = { id: 1, title: 'Tarea Test' };
      const createdNotification = {
        id: 1,
        ...createDto,
        user: mockUser,
        task: mockTask,
        read: false,
        createdAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockNotificationRepository.create.mockReturnValue(createdNotification);
      mockNotificationRepository.save.mockResolvedValue(createdNotification);

      const result = await notificationService.create(createDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result.id).toBe(1);
      expect(result.type).toBe(NotificationType.TASK_ASSIGNED);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const createDto = {
        type: NotificationType.TASK_ASSIGNED,
        message: 'Notificación',
        userId: 'nonexistent',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(notificationService.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTaskAssignedNotification', () => {
    it('debe crear notificación de tarea asignada', async () => {
      const mockTask = { id: 1, title: 'Tarea importante' } as Task;
      const createdNotification = {
        id: 1,
        type: NotificationType.TASK_ASSIGNED,
        message: `${mockAssigner.email} te ha asignado la tarea "${mockTask.title}"`,
        user: mockUser,
        task: mockTask,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockNotificationRepository.create.mockReturnValue(createdNotification);
      mockNotificationRepository.save.mockResolvedValue(createdNotification);

      const result = await notificationService.createTaskAssignedNotification(
        mockTask,
        mockUser,
        mockAssigner,
      );

      expect(result.type).toBe(NotificationType.TASK_ASSIGNED);
      expect(result.message).toContain(mockAssigner.email);
      expect(result.message).toContain(mockTask.title);
    });
  });

  describe('createCommentNotification', () => {
    it('debe crear notificación de comentario', async () => {
      const mockTask = { id: 1, title: 'Tarea con comentario' } as Task;
      const createdNotification = {
        id: 1,
        type: NotificationType.COMMENT_ADDED,
        message: `${mockAssigner.email} ha comentado en tu tarea "${mockTask.title}"`,
        user: mockUser,
        task: mockTask,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockNotificationRepository.create.mockReturnValue(createdNotification);
      mockNotificationRepository.save.mockResolvedValue(createdNotification);

      const result = await notificationService.createCommentNotification(
        mockTask,
        mockUser,
        mockAssigner,
      );

      expect(result?.type).toBe(NotificationType.COMMENT_ADDED);
    });

    it('debe retornar null si el autor del comentario es el dueño de la tarea', async () => {
      const mockTask = { id: 1, title: 'Mi tarea' } as Task;

      const result = await notificationService.createCommentNotification(
        mockTask,
        mockUser,
        mockUser,
      );

      expect(result).toBeNull();
    });
  });

  describe('findAllForUser', () => {
    it('debe retornar notificaciones del usuario', async () => {
      const mockNotifications = [
        { id: 1, message: 'Notificación 1', read: false },
        { id: 2, message: 'Notificación 2', read: true },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await notificationService.findAllForUser(mockUser);

      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        relations: ['task'],
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result.length).toBe(2);
    });
  });

  describe('findUnreadForUser', () => {
    it('debe retornar solo notificaciones no leídas', async () => {
      const mockNotifications = [{ id: 1, message: 'No leída', read: false }];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await notificationService.findUnreadForUser(mockUser);

      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id }, read: false },
        relations: ['task'],
        order: { createdAt: 'DESC' },
      });
      expect(result.length).toBe(1);
    });
  });

  describe('getUnreadCount', () => {
    it('debe retornar el conteo de no leídas', async () => {
      mockNotificationRepository.count.mockResolvedValue(5);

      const result = await notificationService.getUnreadCount(mockUser);

      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('debe marcar notificación como leída', async () => {
      const notification = { id: 1, read: false, user: mockUser };

      mockNotificationRepository.findOne.mockResolvedValue(notification);
      mockNotificationRepository.save.mockResolvedValue({ ...notification, read: true });

      const result = await notificationService.markAsRead(1, mockUser);

      expect(result.read).toBe(true);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(notificationService.markAsRead(999, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('debe marcar todas como leídas', async () => {
      mockNotificationRepository.update.mockResolvedValue({ affected: 3 });

      await notificationService.markAllAsRead(mockUser);

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        { user: { id: mockUser.id }, read: false },
        { read: true },
      );
    });
  });

  describe('delete', () => {
    it('debe eliminar la notificación', async () => {
      const notification = { id: 1, user: mockUser };

      mockNotificationRepository.findOne.mockResolvedValue(notification);
      mockNotificationRepository.remove.mockResolvedValue(notification);

      await notificationService.delete(1, mockUser);

      expect(mockNotificationRepository.remove).toHaveBeenCalledWith(notification);
    });
  });
});
