import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiCreatedResponse({
    description: 'Usuario creado exitosamente',
    schema: {
      example: { message: 'Usuario registrado exitosamente' },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o conflicto' })
  async register(@Body() registerDto: RegisterDto) {
    const { email, password } = registerDto;
    await this.authService.register(email, password);

    return {
      message: 'Usuario registrado exitosamente',
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    schema: {
      example: {
        access_token: 'JWT_TOKEN_AQUÍ',
        user: {
          id: 'user-id',
          email: 'correo@ejemplo.com',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() body: LoginUserDto) {
    const { email, password } = body;
    const loginUserDto = await this.authService.validateUser(email, password);
    return this.authService.login(loginUserDto);
  }
}
