import { Controller, UseFilters, UseInterceptors, SerializeOptions, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { RoleService } from '../../shared/services/role.service';
import { ApiTags } from '@nestjs/swagger';
import { AdminExceptionFilter } from '../filters/exception.filter';



@ApiTags('Role')
@SerializeOptions({ strategy: 'exposeAll' }) // 序列化选项 - 暴露所有属性
@UseInterceptors(ClassSerializerInterceptor) // 类序列化拦截器 - 用于序列化响应数据
@UseFilters(AdminExceptionFilter) // 异常过滤器 - 用于处理异常情况
@Controller('role') // 控制器路由前缀 - /role
export class RoleController {
  private readonly logger = new Logger(RoleController.name); // 日志记录器 - 用于记录日志
  constructor(private readonly roleService: RoleService) {} // 注入角色服务
}