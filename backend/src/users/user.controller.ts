import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente.',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Obtener un usuario por UUID' })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Identificador único del usuario (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async findOne(@Param('uuid') uuid: string): Promise<UserResponseDto> {
    const user = await this.userService.findOneByUuid(uuid);
    if (!user) {
      throw new NotFoundException(`Usuario con UUID ${uuid} no encontrado`);
    }
    const { id, email, createdAt } = user;
    return { id, email, createdAt };
  }
}
