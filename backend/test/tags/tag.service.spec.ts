import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TagService } from 'src/tags/tag.service';
import { Tag } from 'src/tags/tag.entity';
import { User } from 'src/users/user.entity';

describe('TagService', () => {
  let tagService: TagService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    tasks: [],
  } as unknown as User;

  const mockTagRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: getRepositoryToken(Tag),
          useValue: mockTagRepository,
        },
      ],
    }).compile();

    tagService = module.get<TagService>(TagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear y guardar una nueva etiqueta', async () => {
      const createTagDto = {
        name: 'Urgente',
        color: '#FF0000',
      };

      const createdTag = {
        id: 1,
        ...createTagDto,
        user: mockUser,
      };

      mockTagRepository.create.mockReturnValue(createdTag);
      mockTagRepository.save.mockResolvedValue(createdTag);

      const result = await tagService.create(createTagDto, mockUser);

      expect(mockTagRepository.create).toHaveBeenCalledWith({
        ...createTagDto,
        user: mockUser,
      });
      expect(mockTagRepository.save).toHaveBeenCalledWith(createdTag);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Urgente');
    });
  });

  describe('findAll', () => {
    it('debe retornar etiquetas del usuario ordenadas por nombre', async () => {
      const mockTags = [
        { id: 1, name: 'Bug', color: '#FF0000' },
        { id: 2, name: 'Feature', color: '#00FF00' },
        { id: 3, name: 'Urgente', color: '#FFFF00' },
      ];

      mockTagRepository.find.mockResolvedValue(mockTags);

      const result = await tagService.findAll(mockUser);

      expect(mockTagRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        order: { name: 'ASC' },
      });
      expect(result.length).toBe(3);
    });
  });

  describe('findOne', () => {
    it('debe retornar una etiqueta si existe', async () => {
      const mockTag = { id: 1, name: 'Bug', color: '#FF0000' };

      mockTagRepository.findOne.mockResolvedValue(mockTag);

      const result = await tagService.findOne(1, mockUser);

      expect(mockTagRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user: { id: mockUser.id } },
      });
      expect(result.id).toBe(1);
    });

    it('debe lanzar NotFoundException si la etiqueta no existe', async () => {
      mockTagRepository.findOne.mockResolvedValue(null);

      await expect(tagService.findOne(999, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByIds', () => {
    it('debe retornar etiquetas por IDs', async () => {
      const mockTags = [
        { id: 1, name: 'Bug', color: '#FF0000' },
        { id: 3, name: 'Urgente', color: '#FFFF00' },
      ];

      mockTagRepository.find.mockResolvedValue(mockTags);

      const result = await tagService.findByIds([1, 3], mockUser);

      expect(result.length).toBe(2);
    });

    it('debe retornar array vacío si no hay IDs', async () => {
      mockTagRepository.find.mockResolvedValue([]);

      const result = await tagService.findByIds([], mockUser);

      expect(result.length).toBe(0);
    });
  });

  describe('update', () => {
    it('debe actualizar la etiqueta existente', async () => {
      const updateDto = { name: 'Bug Fix', color: '#00FF00' };
      const existingTag = { id: 1, name: 'Bug', color: '#FF0000' };
      const updatedTag = { ...existingTag, ...updateDto };

      mockTagRepository.findOne.mockResolvedValue(existingTag);
      mockTagRepository.save.mockResolvedValue(updatedTag);

      const result = await tagService.update(1, updateDto, mockUser);

      expect(mockTagRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Bug Fix');
      expect(result.color).toBe('#00FF00');
    });

    it('debe lanzar NotFoundException si la etiqueta no existe', async () => {
      mockTagRepository.findOne.mockResolvedValue(null);

      await expect(
        tagService.update(999, { name: 'Test' }, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar la etiqueta especificada', async () => {
      const mockTag = { id: 1, name: 'Bug' };

      mockTagRepository.findOne.mockResolvedValue(mockTag);
      mockTagRepository.remove.mockResolvedValue(mockTag);

      await tagService.remove(1, mockUser);

      expect(mockTagRepository.remove).toHaveBeenCalledWith(mockTag);
    });

    it('debe lanzar NotFoundException si la etiqueta no existe', async () => {
      mockTagRepository.findOne.mockResolvedValue(null);

      await expect(tagService.remove(999, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
