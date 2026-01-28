import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './tag.entity';
import { User } from 'src/users/user.entity';
import { CreateTagDto, UpdateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto, user: User): Promise<Tag> {
    const tag = this.tagRepository.create({
      ...createTagDto,
      user,
    });
    return this.tagRepository.save(tag);
  }

  async findAll(user: User): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { user: { id: user.id } },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, user: User): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async findByIds(ids: number[], user: User): Promise<Tag[]> {
    return this.tagRepository.find({
      where: {
        id: In(ids),
        user: { id: user.id },
      },
    });
  }

  async update(id: number, updateTagDto: UpdateTagDto, user: User): Promise<Tag> {
    const tag = await this.findOne(id, user);
    Object.assign(tag, updateTagDto);
    return this.tagRepository.save(tag);
  }

  async remove(id: number, user: User): Promise<void> {
    const tag = await this.findOne(id, user);
    await this.tagRepository.remove(tag);
  }
}
