import { Controller, UseFilters, UseInterceptors, SerializeOptions, ClassSerializerInterceptor, Logger, Get, Body, Post, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { RoleService } from '../../shared/services/role.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminExceptionFilter } from '../filters/exception.filter';
import { Role } from '../../shared/entities/role.entity';
import { CreateRoleDto, RolePageDto, UpdateRoleDto } from '../../shared/dtos/role.dto';



@ApiTags('Role')
@SerializeOptions({ strategy: 'exposeAll' }) // 序列化选项 - 暴露所有属性
@UseInterceptors(ClassSerializerInterceptor) // 类序列化拦截器 - 用于序列化响应数据
@UseFilters(AdminExceptionFilter) // 异常过滤器 - 用于处理异常情况
@Controller('role') // 控制器路由前缀 - /role
export class RoleController {
  private readonly logger = new Logger(RoleController.name); // 日志记录器 - 用于记录日志
  constructor(private readonly roleService: RoleService) { } // 注入角色服务

  @Get('list')
  @ApiOperation({ summary: '角色列表' })
  @ApiResponse({ status: 200, description: '成功返回角色列表', type: [Role] })
  async getRoleList() {
    return this.roleService.getList();
  }

  @Post('page')
  @ApiOperation({ summary: '角色分页' })
  @ApiBody({ type: RolePageDto })
  @ApiResponse({ status: 200, description: '成功返回角色分页列表', type: [Role] })
  async getPage(@Body() pageDto: RolePageDto) {
    const { pageNum = 1, pageSize = 10, ...query } = pageDto;
    return await this.roleService.getPageByQuery(pageNum, pageSize, query);
  }

  @Post('create')
  @ApiOperation({ summary: '新增角色' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 200, description: '成功创建角色', type: Role })
  async create(@Body() CreateRoleDto: CreateRoleDto) {
    return this.roleService.create(CreateRoleDto);
  }

  @Post('update')
  @ApiOperation({ summary: '编辑角色' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: '成功更新角色', type: Role })
  async update(@Body() UpdateRoleDto: UpdateRoleDto) {
    const { id, ...rest } = UpdateRoleDto;
    await this.roleService.update(id, rest);
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'id', description: '角色ID', type: Number })
  @ApiResponse({ status: 200, description: '成功删除角色', type: Role })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.roleService.delete(id);
    return null;
  }
}