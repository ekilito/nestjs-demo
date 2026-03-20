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
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../shared/dtos/category.dto';
import { Result } from '../../shared/vo/result';
import { CategoryService } from '../../shared/services/category.service';
import { Category } from '../../shared/entities/category.entity';

@ApiTags('Category')
@SerializeOptions({ strategy: 'exposeAll' }) // 序列化选项 - 暴露所有属性
@UseInterceptors(ClassSerializerInterceptor) // 类序列化拦截器 - 用于序列化响应数据
@UseFilters(AdminExceptionFilter) // 异常过滤器 - 用于处理异常情况
@Controller('category') // 控制器路由前缀 - /category
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { } // 注入分类服务

  @Get('tree')
  @ApiOperation({ summary: '分类列表' })
  @ApiResponse({ status: 200, description: '成功返回分类列表', type: [Category] })
  async getCategoryList() {
    return this.categoryService.getTree();
  }

  @Post('create')
  @ApiOperation({ summary: '新增分类' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 200, description: '成功创建分类', type: Result })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    await this.categoryService.create(createCategoryDto);
    return null;
  }

  @Post('update')
  @ApiOperation({ summary: '编辑分类' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: '成功更新分类', type: Result })
  async update(@Body() updateCategoryDto: UpdateCategoryDto) {
    const { id, ...rest } = updateCategoryDto;
    await this.categoryService.update(id, updateCategoryDto);
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除分类' })
  @ApiParam({ name: 'id', description: '分类 ID', type: String })
  @ApiResponse({ status: 200, description: '成功删除分类', type: Result })
  async delete(@Param('id') id: string) {
    await this.categoryService.delete(id);
    return null;
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '分类详情' })
  @ApiParam({ name: 'id', description: '分类 ID', type: String })
  @ApiResponse({ status: 200, description: '成功返回分类详情', type: Category })
  async getDetail(@Param('id') id: string) {
    return await this.categoryService.getDetailById(id);
  }
}