import {
  Controller,
  UseFilters,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Get,
  Body,
  Post,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminExceptionFilter } from '../filters/exception.filter';
import {
  CreateAccessDto,
  AccessPageDto,
  UpdateAccessDto,
} from '../../shared/dtos/access.dto';
import { Result } from '../../shared/vo/result';
import { AccessService } from '../../shared/services/access.service';
import { Access } from '../../shared/entities/access.entity';

@ApiTags('Access')
@SerializeOptions({ strategy: 'exposeAll' }) // 序列化选项 - 暴露所有属性
@UseInterceptors(ClassSerializerInterceptor) // 类序列化拦截器 - 用于序列化响应数据
@UseFilters(AdminExceptionFilter) // 异常过滤器 - 用于处理异常情况
@Controller('access') // 控制器路由前缀 - /access
export class AccessController {
  constructor(private readonly accessService: AccessService) { } // 注入访问服务

  @Get('tree')
  @ApiOperation({ summary: '资源列表' })
  @ApiResponse({ status: 200, description: '成功返回资源列表', type: [Access] })
  async getAccessList() {
    return this.accessService.getTree();
  }

  @Post('page')
  @ApiOperation({ summary: '资源分页' })
  @ApiBody({ type: AccessPageDto })
  @ApiResponse({
    status: 200,
    description: '成功返回资源分页列表',
    type: [Access],
  })
  async getPage(@Body() pageDto: AccessPageDto) {
    const { pageNum = 1, pageSize = 10, ...query } = pageDto;
    return await this.accessService.getPageByQuery(pageNum, pageSize, query);
  }

  @Post('create')
  @ApiOperation({ summary: '新增资源' })
  @ApiBody({ type: CreateAccessDto })
  @ApiResponse({ status: 200, description: '成功创建资源', type: Result })
  async create(@Body() createAccessDto: CreateAccessDto) {
    await this.accessService.create(createAccessDto);
    return null;
  }

  @Post('update')
  @ApiOperation({ summary: '编辑资源' })
  @ApiBody({ type: UpdateAccessDto })
  @ApiResponse({ status: 200, description: '成功更新资源', type: Result })
  async update(@Body() updateAccessDto: UpdateAccessDto) {
    const { id, ...rest } = updateAccessDto;
    await this.accessService.update(id, updateAccessDto);
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除资源' })
  @ApiParam({ name: 'id', description: '资源ID', type: String })
  @ApiResponse({ status: 200, description: '成功删除资源', type: Result })
  async delete(@Param('id') id: string) {
    await this.accessService.delete(id);
    return null;
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '资源详情' })
  @ApiParam({ name: 'id', description: '资源ID', type: String })
  @ApiResponse({ status: 200, description: '成功返回资源详情', type: Access })
  async getDetail(@Param('id') id: string) {
    return await this.accessService.getDetailById(id);
  }
}
