import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'nuevo-usuario@ejemplo.com',
    description: 'Correo electrónico único para el usuario',
  })
  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El email no puede estar vacío' })
  @MaxLength(30, { message: 'El email no puede exceder 30 caracteres' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Contraseña del usuario, mínimo 6 caracteres',
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
