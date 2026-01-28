import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TagService } from './tag.service';
import { CreateTagDto, UpdateTagDto, TagResponseDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('tags')
@ApiTags('Tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created', type: TagResponseDto })
  async create(@Body() createTagDto: CreateTagDto, @GetUser() user: User) {
    return this.tagService.create(createTagDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags for current user' })
  @ApiResponse({ status: 200, description: 'List of tags', type: [TagResponseDto] })
  async findAll(@GetUser() user: User) {
    return this.tagService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiResponse({ status: 200, description: 'Tag found', type: TagResponseDto })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.tagService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiResponse({ status: 200, description: 'Tag updated', type: TagResponseDto })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
    @GetUser() user: User,
  ) {
    return this.tagService.update(id, updateTagDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiResponse({ status: 200, description: 'Tag deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    await this.tagService.remove(id, user);
    return { message: 'Tag deleted successfully' };
  }
}
