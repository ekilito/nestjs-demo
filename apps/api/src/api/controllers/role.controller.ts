import { Controller, UseFilters, UseInterceptors, SerializeOptions, ClassSerializerInterceptor, Logger, Get, Body, Post, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { RoleService } from '../../shared/services/role.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiExceptionFilter } from '../filters/exception.filter';
import { Role } from '../../shared/entities/role.entity';
import { CreateRoleDto, RolePageDto, UpdateRoleDto, UpdateRoleAccessesDto } from '../../shared/dtos/role.dto';
import { Result } from '../../shared/vo/result';
import { AccessService } from '../../shared/services/access.service';



@ApiTags('Role')
@SerializeOptions({ strategy: 'exposeAll' }) // 序列化选项 - 暴露所有属性
@UseInterceptors(ClassSerializerInterceptor) // 类序列化拦截器 - 用于序列化响应数据
@UseFilters(ApiExceptionFilter) // 异常过滤器 - 用于处理异常情况
@Controller('role') // 控制器路由前缀 - /role
export class RoleController {
  private readonly logger = new Logger(RoleController.name); // 日志记录器 - 用于记录日志
  constructor(private readonly roleService: RoleService) { } // 注入角色服务
  private readonly accessService: AccessService; // 注入资源服务

  @Get('list')
  @ApiOperation({ summary: '角色列表' })
  @ApiResponse({ status: 200, description: '成功返回角色列表', type: [Role] })
  async getRoleList() {
    return this.roleService.getList({
      relations: ['accesses'], // 👈 添加资源关联，这样返回的角色列表会包含 accesses 字段
    });
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
  @ApiResponse({ status: 200, description: '成功创建角色', type: Result })
  async create(@Body() createRoleDto: CreateRoleDto) {
    await this.roleService.create(createRoleDto);
    return null;
  }

  @Post('update')
  @ApiOperation({ summary: '编辑角色' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: '成功更新角色', type: Result })
  async update(@Body() updateRoleDto: UpdateRoleDto) {
    const { id, ...rest } = updateRoleDto;
    await this.roleService.update(id, rest);
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'id', description: '角色 ID', type: Number })
  @ApiResponse({ status: 200, description: '成功删除角色', type: Result })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.roleService.delete(id);
    return null;
  }

  // 为角色分配资源
  @Post('/updateAccesses')
  @ApiOperation({ summary: '分配角色资源' })
  @ApiBody({ type: UpdateRoleAccessesDto })
  @ApiResponse({ status: 200, description: '角色资源分配成功', type: Result })
  async updateAccesses(@Body() updateRoleAccessesDto: UpdateRoleAccessesDto) {
    const { roleId, accessIds } = updateRoleAccessesDto;
    await this.roleService.updateAccesses(roleId, updateRoleAccessesDto);
    return Result.ok(null, '资源分配成功');
  }
}