import { Injectable } from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

// 角色服务类
// 继承 MySQLBaseService 提供基础的操作
@Injectable()
export class RoleService extends MySQLBaseService<Role> {
  constructor(
    @InjectRepository(Role) // 注入 Role 实体的仓库
    protected repository: Repository<Role>, // Role 实体的仓库实例，可在子类访问
  ) {
    super(repository); // 调用父类构造函数，初始化仓库实例
  }
}
