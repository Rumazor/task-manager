import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentService } from 'src/comments/comment.service';
import { Comment } from 'src/comments/comment.entity';
import { Task } from 'src/tasks/task.entity';
import { User } from 'src/users/user.entity';

describe('CommentService', () => {
  let commentService: CommentService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    tasks: [],
  } as unknown as User;

  const mockOtherUser = {
    id: 'user-456',
    email: 'other@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    tasks: [],
  } as unknown as User;

  const mockCommentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockTaskRepository = {
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un comentario en una tarea existente', async () => {
      const createCommentDto = {
        content: 'Este es un comentario',
        taskId: 1,
      };

      const mockTask = { id: 1, title: 'Tarea Test' };
      const createdComment = {
        id: 1,
        content: createCommentDto.content,
        author: mockUser,
        task: mockTask,
        createdAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockCommentRepository.create.mockReturnValue(createdComment);
      mockCommentRepository.save.mockResolvedValue(createdComment);

      const result = await commentService.create(createCommentDto, mockUser);

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        content: createCommentDto.content,
        author: mockUser,
        task: mockTask,
      });
      expect(result.id).toBe(1);
    });

    it('debe lanzar NotFoundException si la tarea no existe', async () => {
      const createCommentDto = {
        content: 'Comentario',
        taskId: 999,
      };

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(
        commentService.create(createCommentDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTask', () => {
    it('debe retornar comentarios de una tarea', async () => {
      const mockComments = [
        {
          id: 1,
          content: 'Comentario 1',
          author: mockUser,
          createdAt: new Date(),
        },
        {
          id: 2,
          content: 'Comentario 2',
          author: mockOtherUser,
          createdAt: new Date(),
        },
      ];

      mockCommentRepository.find.mockResolvedValue(mockComments);

      const result = await commentService.findByTask(1);

      expect(mockCommentRepository.find).toHaveBeenCalledWith({
        where: { task: { id: 1 } },
        relations: ['author'],
        order: { createdAt: 'DESC' },
      });
      expect(result.length).toBe(2);
    });
  });

  describe('findOne', () => {
    it('debe retornar un comentario si existe', async () => {
      const mockComment = {
        id: 1,
        content: 'Comentario',
        author: mockUser,
        task: { id: 1 },
      };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      const result = await commentService.findOne(1);

      expect(result.id).toBe(1);
    });

    it('debe lanzar NotFoundException si el comentario no existe', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(commentService.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar el comentario si el usuario es el autor', async () => {
      const updateDto = { content: 'Comentario actualizado' };
      const existingComment = {
        id: 1,
        content: 'Comentario original',
        author: mockUser,
        task: { id: 1 },
      };

      mockCommentRepository.findOne.mockResolvedValue(existingComment);
      mockCommentRepository.save.mockResolvedValue({
        ...existingComment,
        ...updateDto,
      });

      const result = await commentService.update(1, updateDto, mockUser);

      expect(result.content).toBe('Comentario actualizado');
    });

    it('debe lanzar ForbiddenException si el usuario no es el autor', async () => {
      const updateDto = { content: 'Intento de actualización' };
      const existingComment = {
        id: 1,
        content: 'Comentario original',
        author: mockOtherUser,
        task: { id: 1 },
      };

      mockCommentRepository.findOne.mockResolvedValue(existingComment);

      await expect(
        commentService.update(1, updateDto, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debe eliminar el comentario si el usuario es el autor', async () => {
      const existingComment = {
        id: 1,
        content: 'Comentario a eliminar',
        author: mockUser,
        task: { id: 1 },
      };

      mockCommentRepository.findOne.mockResolvedValue(existingComment);
      mockCommentRepository.remove.mockResolvedValue(existingComment);

      await commentService.remove(1, mockUser);

      expect(mockCommentRepository.remove).toHaveBeenCalledWith(existingComment);
    });

    it('debe lanzar ForbiddenException si el usuario no es el autor', async () => {
      const existingComment = {
        id: 1,
        content: 'Comentario de otro usuario',
        author: mockOtherUser,
        task: { id: 1 },
      };

      mockCommentRepository.findOne.mockResolvedValue(existingComment);

      await expect(commentService.remove(1, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('sanitizeComment', () => {
    it('debe sanitizar correctamente un comentario', () => {
      const comment = {
        id: 1,
        content: 'Comentario',
        author: { id: 'user-123', email: 'test@example.com', password: 'secret' },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Comment;

      const result = commentService.sanitizeComment(comment);

      expect(result.author).not.toHaveProperty('password');
      expect(result.author.email).toBe('test@example.com');
    });
  });
});
