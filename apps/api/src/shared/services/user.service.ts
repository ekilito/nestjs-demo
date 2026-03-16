import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UtilityService } from './utility.service';

// 用户服务类
// 继承 MySQLBaseService 提供基础的 CRUD 操作
@Injectable()
export class UserService extends MySQLBaseService<User> {
  constructor(
    @InjectRepository(User) // 注入 User 实体的仓库
    protected repository: Repository<User>, // 用户实体的仓库实例，可在子类访问
    private readonly utilityService: UtilityService, // 密码加密服务，用于对密码进行哈希处理
  ) {
    super(repository); // 调用父类构造函数，初始化仓库实例
  }

  async create(createDto: DeepPartial<User>): Promise<User> { // DeepPartial<User>类型，允许只传递部分User属性
    const dto = { ...createDto } as Record<string, unknown>; // 创建createDto的副本 类型断言便于操作属性
    if (typeof dto.password === 'string') {
      dto.password = await this.utilityService.hashPassword(dto.password); // 对密码进行哈希处理
    }
    return await super.create(dto as DeepPartial<User>); // 调用父类方法创建用户
  }

  async update(
    id: number | string,
    updateDto: QueryDeepPartialEntity<User>, // 更新用户的部分属性
  ): Promise<User> {
    const dto = { ...(updateDto as Record<string, unknown>) } as Record<
      string,
      unknown
    >;
    if (typeof dto.password === 'string') {
      dto.password = await this.utilityService.hashPassword(dto.password);
    }
    return await super.update(id, dto as QueryDeepPartialEntity<User>); // 调用父类方法更新用户
  }

  // 分页查询方法，重写父类方法
  async getPage(
    pageNum: number = 1,
    pageSize: number = 10,
    third?: // 分页查询参数，支持 TypeORM 的 FindManyOptions 或自定义查询参数
      | FindManyOptions<User> // TypeORM 查询选项，用于自定义查询
      | {
        username?: string;
        status?: number;
      },
  ) {
    const isFindOptions =
      third &&
      typeof third === 'object' &&
      ('where' in third || 'order' in third || 'relations' in third);
    if (isFindOptions) {
      return super.getPage(pageNum, pageSize, third as FindManyOptions<User>);
    }

    const q = (third ?? {}) as {
      username?: string;
      status?: number;
    };

    const where: FindOptionsWhere<User> = {}; // 创建查询条件对象
    // 创建查询条件对象 如果有值，添加模糊查询条件
    const username = typeof q.username === 'string' ? q.username.trim() : '';
    if (username) where.username = Like(`%${username}%`);
    if (typeof q.status === 'number' && !Number.isNaN(q.status)) {
      where.status = q.status;
    }
  
    return super.getPage(pageNum, pageSize, {
      where: Object.keys(where).length > 0 ? where : undefined,
    });
  }
}
