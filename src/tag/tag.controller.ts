import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}
  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  async findAll(): Promise<{tags: string[]}> {
  const tags =   await this.tagService.findAll();
  return {
    tags: tags.map(tag => tag.name)
  }
  }
}
