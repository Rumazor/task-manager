import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { LoginUserDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe llamar a authService.register y retornar usuario con token', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: '123456',
        name: 'Test User',
      };
      const mockResult = {
        user: { id: '1', email: dto.email, name: dto.name },
        token: 'fake-jwt-token',
      };
      mockAuthService.register.mockResolvedValueOnce(mockResult);

      const result = await authController.register(dto);

      expect(authService.register).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        dto.name,
      );
      expect(result).toEqual({
        message: 'Usuario registrado exitosamente',
        user: mockResult.user,
        token: mockResult.token,
      });
    });
  });

  describe('login', () => {
    it('debe retornar el resultado del login', async () => {
      const dto: LoginUserDto = {
        email: 'test@example.com',
        password: '123456',
      };
      const fakeLoginResult = {
        id: '1',
        email: dto.email,
        token: 'fake-jwt-token',
      };

      mockAuthService.login.mockResolvedValueOnce(fakeLoginResult);

      const result = await authController.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toBe(fakeLoginResult);
    });
  });

  describe('forgotPassword', () => {
    it('debe llamar a authService.forgotPassword', async () => {
      const email = 'test@example.com';
      const mockResponse = {
        message: 'Si el email existe, recibiras instrucciones para restablecer tu contraseña',
      };

      mockAuthService.forgotPassword.mockResolvedValueOnce(mockResponse);

      const result = await authController.forgotPassword({ email });

      expect(authService.forgotPassword).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('debe llamar a authService.resetPassword con token y nueva contraseña', async () => {
      const token = 'reset-token';
      const password = 'newPassword123';
      const mockResponse = { message: 'Contraseña actualizada exitosamente' };

      mockAuthService.resetPassword.mockResolvedValueOnce(mockResponse);

      const result = await authController.resetPassword(token, { password });

      expect(authService.resetPassword).toHaveBeenCalledWith(token, password);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMe', () => {
    it('debe retornar información del usuario actual', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        role: 'user',
      };

      const result = await authController.getMe(mockUser as any);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatar: mockUser.avatar,
        role: mockUser.role,
      });
    });
  });

  describe('updateProfile', () => {
    it('debe llamar a authService.updateProfile', async () => {
      const mockUser = { id: 'user-123' };
      const updateData = { name: 'New Name' };
      const mockResponse = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'New Name',
      };

      mockAuthService.updateProfile.mockResolvedValueOnce(mockResponse);

      const result = await authController.updateProfile(mockUser as any, updateData);

      expect(authService.updateProfile).toHaveBeenCalledWith('user-123', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('debe llamar a authService.changePassword', async () => {
      const mockUser = { id: 'user-123' };
      const body = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      };
      const mockResponse = { message: 'Contraseña cambiada exitosamente' };

      mockAuthService.changePassword.mockResolvedValueOnce(mockResponse);

      const result = await authController.changePassword(mockUser as any, body);

      expect(authService.changePassword).toHaveBeenCalledWith(
        'user-123',
        body.currentPassword,
        body.newPassword,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
