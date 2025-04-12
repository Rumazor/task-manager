import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
  async register(email: string, password: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    try {
      const newUser = this.usersRepository.create({
        email,
        password: bcrypt.hashSync(password, 10),
      });

      await this.usersRepository.save(newUser);

      const { password: _, ...user } = newUser;

      return {
        user,
        token: this.getJwtToken({
          id: newUser.id,
        }),
      };
    } catch (error) {
      console.error('Error al crear usuario :', error);
      throw new error();
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Credenciales inválidas (usuario no encontrado)',
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Credenciales inválidas (contraseña)');
    }

    return user;
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      select: { email: true, password: true, id: true },
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales inválidas (contraseña)');

    const { password: _, ...loggedUser } = user;

    return {
      ...loggedUser,
      token: this.getJwtToken({
        id: user.id,
      }),
    };
  }
}
