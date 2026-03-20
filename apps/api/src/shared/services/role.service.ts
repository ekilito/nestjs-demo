import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { UpdateRoleAccessesDto } from '../dtos/role.dto';
import { Access } from '../entities/access.entity';
import { updateEntityRelations } from '../utils/comm';

// 角色服务类
// 继承 MySQLBaseService 提供基础的操作
@Injectable()
export class RoleService extends MySQLBaseService<Role> {
  constructor(
    @InjectRepository(Role) // 注入 Role 实体的仓库
    protected repository: Repository<Role>, // Role 实体的仓库实例，可在子类访问
    @InjectRepository(Access) private readonly accessRepository: Repository<Access>, // 资源实体的仓库实例
  ) {
    super(repository); // 调用父类构造函数，初始化仓库实例
  }

  // 为角色分配资源
  async updateAccesses(id: number, dto: UpdateRoleAccessesDto) {
    return updateEntityRelations(
      this.repository.manager,        // EntityManager
      Role,                           // 实体类
      id,                             // 实体 ID
      'accesses',                     // 关系字段
      Access,                         // 关联实体类
      dto.accessIds,                  // 关联 ID 列表
      `角色 ${id} 未找到`,            // 自定义错误消息
      '无效的资源 ID'                 // 自定义错误消息
    );
  }

  // 重写 getPageByQuery 方法，添加 accesses 关联加载
  async getPageByQuery(
    pageNum: number = 1,
    pageSize: number = 10,
    query?: Record<string, any>,
  ) {
    return super.getPageByQuery(pageNum, pageSize, query, ['accesses']);
  }
}
