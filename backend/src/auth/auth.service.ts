import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from 'src/users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginUserDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository, MoreThan } from 'typeorm';
import { JwtPayload } from './jwt-payload.interface';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async register(email: string, password: string, name?: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('El email ya esta registrado');
    }

    try {
      const newUser = this.usersRepository.create({
        email,
        password: bcrypt.hashSync(password, 10),
        name,
      });

      await this.usersRepository.save(newUser);

      const { password: _, ...user } = newUser;

      // Send welcome email
      this.mailService.sendWelcomeEmail(email, name);

      return {
        user,
        token: this.getJwtToken({
          id: newUser.id,
        }),
      };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw new BadRequestException('Error al crear usuario');
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (!user.password) {
      throw new UnauthorizedException('Usa el login social para este usuario');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    return user;
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      select: { email: true, password: true, id: true, name: true, role: true },
    });

    if (!user) throw new UnauthorizedException('Credenciales invalidas');

    if (!user.password) {
      throw new UnauthorizedException('Usa el login social para este usuario');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales invalidas');

    const { password: _, ...loggedUser } = user;

    return {
      ...loggedUser,
      token: this.getJwtToken({
        id: user.id,
      }),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      return { message: 'Si el email existe, recibiras instrucciones para restablecer tu contraseña' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiry to 1 hour
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Save to user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await this.usersRepository.save(user);

    // Send email with the raw token (not hashed)
    await this.mailService.sendPasswordResetEmail(email, resetToken, user.name);

    return { message: 'Si el email existe, recibiras instrucciones para restablecer tu contraseña' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Hash the token to compare with stored hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Token invalido o expirado');
    }

    // Update password
    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async validateOAuthUser(
    provider: 'google' | 'github',
    profile: { id: string; email: string; name?: string; avatar?: string },
  ) {
    const providerIdField = provider === 'google' ? 'googleId' : 'githubId';

    // Check if user exists by provider ID
    let user = await this.usersRepository.findOne({
      where: { [providerIdField]: profile.id },
    });

    if (!user) {
      // Check if user exists by email
      user = await this.usersRepository.findOne({
        where: { email: profile.email },
      });

      if (user) {
        // Link the OAuth account to existing user
        user[providerIdField] = profile.id;
        if (!user.name && profile.name) user.name = profile.name;
        if (!user.avatar && profile.avatar) user.avatar = profile.avatar;
        await this.usersRepository.save(user);
      } else {
        // Create new user
        user = this.usersRepository.create({
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          [providerIdField]: profile.id,
        });
        await this.usersRepository.save(user);
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.avatar !== undefined) user.avatar = data.avatar;

    await this.usersRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (!user.password) {
      throw new BadRequestException('Este usuario usa login social');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Contraseña cambiada exitosamente' };
  }
}
