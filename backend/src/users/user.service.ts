import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneByUuid(uuid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: uuid } });
  }

  async findAll() {
    return this.userRepository.find({
      select: { id: true, email: true, createdAt: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }
}
