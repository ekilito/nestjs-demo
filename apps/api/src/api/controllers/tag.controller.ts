import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { CreateTagDto, UpdateTagDto } from '../../shared/dtos/tag.dto';
import { TagService } from '../../shared/services/tag.service';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { Tag } from '../../shared/entities/tag.entity';
import { Result } from '../../shared/vo/result';

@ApiTags('tag')
@SerializeOptions({ strategy: 'exposeAll' })
@UseInterceptors(ClassSerializerInterceptor)
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) { }

  @Get('list')
  @ApiOperation({ summary: '标签列表' })
  @ApiResponse({ status: 200, description: '成功返回标签列表', type: [Tag] })
  async getList() {
    return await this.tagService.getList();
  }

  @Post('/create')
  @ApiOperation({ summary: '新增标签' })
  @ApiBody({ type: CreateTagDto })
  @ApiResponse({ status: 200, description: '标签成功创建', type: Tag })
  async create(@Body() createTagDto: CreateTagDto) {
    const result = await this.tagService.create(createTagDto);
    return Result.ok(null, '标签创建成功');
  }

  @Post('/update')
  @ApiOperation({ summary: '编辑标签' })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({ status: 200, description: '标签信息更新成功', type: Result })
  async update(@Body() updateTagDto: UpdateTagDto) {
    const { id, ...data } = updateTagDto;
    const result = await this.tagService.update(id, data);
    return Result.ok(null, '标签更新成功');
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: '删除标签' })
  @ApiParam({ name: 'id', description: '标签 ID', type: String })
  @ApiResponse({ status: 200, description: '标签删除成功', type: Result })
  async delete(@Param('id') id: string) {
    await this.tagService.delete(id);
    return Result.ok(null, '标签删除成功');
  }

  @Get('getById/:id')
  @ApiOperation({ summary: '标签详情' })
  @ApiResponse({ status: 200, description: '成功返回标签信息', type: Tag })
  @ApiResponse({ status: 404, description: '标签未找到' })
  @ApiParam({ name: 'id', description: '标签 ID', type: String })
  async getById(@Param('id') id: string) {
    return await this.tagService.getById(id);
  }
}