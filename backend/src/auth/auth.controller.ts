import { Controller, Post, Patch, Get, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiCreatedResponse({
    description: 'Usuario creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos invalidos o conflicto' })
  async register(@Body() registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    const result = await this.authService.register(email, password, name);

    return {
      message: 'Usuario registrado exitosamente',
      user: result.user,
      token: result.token,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesion con email y contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesion exitoso',
  })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  async login(@Body() body: LoginUserDto) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiResponse({ status: 200, description: 'Email enviado si existe' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password/:token')
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  @ApiResponse({ status: 400, description: 'Token invalido o expirado' })
  async resetPassword(
    @Param('token') token: string,
    @Body() body: { password: string },
  ) {
    return this.authService.resetPassword(token, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario actual' })
  @ApiResponse({ status: 200, description: 'Usuario actual' })
  async getMe(@GetUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado' })
  async updateProfile(
    @GetUser() user: User,
    @Body() body: { name?: string; avatar?: string },
  ) {
    return this.authService.updateProfile(user.id, body);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada' })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta' })
  async changePassword(
    @GetUser() user: User,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      user.id,
      body.currentPassword,
      body.newPassword,
    );
  }
}
