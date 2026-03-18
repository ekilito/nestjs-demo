import { Injectable } from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
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

  // 分页查询方法，重写父类方法
  async getPage(
    pageNum: number = 1,
    pageSize: number = 10,
    third?: // 分页查询参数，支持 TypeORM 的 FindManyOptions 或自定义查询参数
      | FindManyOptions<Role> // TypeORM 查询选项，用于自定义查询
      | {
        name?: string;
      },
  ) {
    const isFindOptions =
      third &&
      typeof third === 'object' &&
      ('where' in third || 'order' in third || 'relations' in third);
    if (isFindOptions) {
      return super.getPage(pageNum, pageSize, third as FindManyOptions<Role>);
    }

    const q = (third ?? {}) as {
      name?: string;
    };

    const where: FindOptionsWhere<Role> = {}; // 创建查询条件对象
    // 创建查询条件对象 如果有值，添加模糊查询条件
    const name = typeof q.name === 'string' ? q.name.trim() : '';
    if (name) where.name = Like(`%${name}%`);

    return super.getPage(pageNum, pageSize, {
      where: Object.keys(where).length > 0 ? where : undefined,
    });
  }
}
