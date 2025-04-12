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
    validateUser: jest.fn(),
    login: jest.fn(),
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
    it('debe llamar a authService.register y retornar un mensaje de éxito', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: '123456',
      };
      mockAuthService.register.mockResolvedValueOnce({
        user: { id: '1', email: dto.email },
        token: 'fake-jwt-token',
      });

      const result = await authController.register(dto);

      expect(authService.register).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(result).toEqual({ message: 'Usuario registrado exitosamente' });
    });
  });

  describe('login', () => {
    it('debe validar al usuario y retornar el resultado del login', async () => {
      const dto: LoginUserDto = {
        email: 'test@example.com',
        password: '123456',
      };
      const fakeUser = { id: '1', email: dto.email, password: 'hashed' };
      const fakeLoginResult = {
        id: '1',
        email: dto.email,
        token: 'fake-jwt-token',
      };

      mockAuthService.validateUser.mockResolvedValueOnce(fakeUser);
      mockAuthService.login.mockResolvedValueOnce(fakeLoginResult);

      const result = await authController.login(dto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(fakeUser);
      expect(result).toBe(fakeLoginResult);
    });
  });
});
