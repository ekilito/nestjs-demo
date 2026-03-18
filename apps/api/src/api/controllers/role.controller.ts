import { Controller, UseFilters, UseInterceptors, SerializeOptions, ClassSerializerInterceptor, Logger, Get, Body, Post } from '@nestjs/common';
import { RoleService } from '../../shared/services/role.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminExceptionFilter } from '../filters/exception.filter';
import { Role } from '../../shared/entities/role.entity';
import { RolePageDto } from '../../shared/dtos/role.dto';



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
    const { pageNum = 1, pageSize = 10, name } = pageDto;
    return await this.roleService.getPage(pageNum, pageSize, {
      name,
    });
  }
}