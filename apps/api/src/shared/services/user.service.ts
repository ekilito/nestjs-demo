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
    protected repository: Repository<User>,
    private readonly utilityService: UtilityService,
  ) {
    super(repository);
  }

  async create(createDto: DeepPartial<User>): Promise<User> {
    const dto = { ...createDto } as Record<string, unknown>;
    if (typeof dto.password === 'string') {
      dto.password = await this.utilityService.hashPassword(dto.password);
    }
    return await super.create(dto as DeepPartial<User>);
  }

  async update(
    id: number | string,
    updateDto: QueryDeepPartialEntity<User>,
  ): Promise<User> {
    const dto = { ...(updateDto as Record<string, unknown>) } as Record<
      string,
      unknown
    >;
    if (typeof dto.password === 'string') {
      dto.password = await this.utilityService.hashPassword(dto.password);
    }
    return await super.update(id, dto as QueryDeepPartialEntity<User>);
  }

  async getPage(
    pageNum: number = 1,
    pageSize: number = 10,
    third?: // 分页查询参数，支持 TypeORM 的 FindManyOptions 或自定义查询参数
      | FindManyOptions<User> 
      | {
        username?: string;
        email?: string;
        mobile?: string;
        status?: number;
        is_super?: boolean;
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
      email?: string;
      mobile?: string;
      status?: number;
      is_super?: boolean;
    };

    const where: FindOptionsWhere<User> = {};
    const username = typeof q.username === 'string' ? q.username.trim() : '';
    if (username) where.username = Like(`%${username}%`);
    const email = typeof q.email === 'string' ? q.email.trim() : '';
    if (email) where.email = Like(`%${email}%`);
    const mobile = typeof q.mobile === 'string' ? q.mobile.trim() : '';
    if (mobile) where.mobile = Like(`%${mobile}%`);
    if (typeof q.status === 'number' && !Number.isNaN(q.status)) {
      where.status = q.status;
    }
    if (typeof q.is_super === 'boolean') {
      where.is_super = q.is_super;
    }

    return super.getPage(pageNum, pageSize, {
      where: Object.keys(where).length > 0 ? where : undefined,
    });
  }
}
