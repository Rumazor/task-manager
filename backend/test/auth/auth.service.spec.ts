import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-jwt-token'),
  };

  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe crear y guardar un nuevo usuario si no existe previamente', async () => {
      // Arrange
      mockUserService.findByEmail.mockResolvedValueOnce(null);
      mockUsersRepository.create.mockReturnValue({
        email: 'test@example.com',
        password: 'hashedPass',
      });
      mockUsersRepository.save.mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPass',
      });

      const result = await authService.register('test@example.com', '123456');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUsersRepository.create).toHaveBeenCalled();
      expect(mockUsersRepository.save).toHaveBeenCalled();
      expect(result.token).toBe('test-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('debe lanzar UnauthorizedException si el usuario ya existe', async () => {
      mockUserService.findByEmail.mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
      });

      await expect(
        authService.register('test@example.com', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUserService.findByEmail.mockResolvedValueOnce(null);

      await expect(
        authService.validateUser('notfound@example.com', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña no coincide', async () => {
      mockUserService.findByEmail.mockResolvedValueOnce({
        email: 'test@example.com',
        password: 'hashedPass',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(
        authService.validateUser('test@example.com', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe retornar el usuario si las credenciales son válidas', async () => {
      const fakeUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPass',
      };
      mockUserService.findByEmail.mockResolvedValueOnce(fakeUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const result = await authService.validateUser(
        'test@example.com',
        '123456',
      );
      expect(result).toBe(fakeUser);
    });
  });

  describe('login', () => {
    it('debe lanzar UnauthorizedException si no encuentra usuario', async () => {
      mockUsersRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        authService.login({ email: 'nope@example.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe retornar el usuario y un token si las credenciales son válidas', async () => {
      mockUsersRepository.findOne.mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPass',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const result = await authService.login({
        email: 'test@example.com',
        password: '123456',
      });
      expect(result.token).toBe('test-jwt-token');
      expect(result.email).toBe('test@example.com');
    });
  });
});
