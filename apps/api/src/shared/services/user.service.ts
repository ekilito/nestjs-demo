import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
