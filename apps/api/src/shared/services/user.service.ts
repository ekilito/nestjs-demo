import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UtilityService } from './utility.service';
import { Role } from '../entities/role.entity';
import { updateEntityRelations } from '../utils/comm';

// 用户服务类
// 继承 MySQLBaseService 提供基础的 CRUD 操作
@Injectable()
export class UserService extends MySQLBaseService<User> {
  constructor(
    @InjectRepository(User) // 注入 User 实体的仓库
    protected repository: Repository<User>, // 用户实体的仓库实例，可在子类访问
    private readonly utilityService: UtilityService, // 密码加密服务，用于对密码进行哈希处理
    @InjectRepository(Role) private readonly roleRepository: Repository<Role> // 角色实体的仓库实例，可在子类访问
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
      relations: ['roles'], // 👈 添加角色关联，这样返回的用户列表会包含 roles 字段
    });
  }

  // 为用户分配角色
  async updateRoles(id: number, roleIds: number[]) {
    return updateEntityRelations(
      this.repository.manager,    // EntityManager
      User,                       // 实体类
      id,                         // 实体 ID
      'roles',                    // 关系字段
      Role,                       // 关联实体类
      roleIds,                    // 关联 ID 列表
      `用户 ${id} 未找到`,          // 自定义错误消息
      '无效的角色 ID'               // 自定义错误消息
    );
  }

  /**
   * 重写 delete 方法，处理角色关联！ （可以🙅重新）
   * TypeORM 会自动删除中间表记录，但为了代码清晰和事务安全，显式处理
   * ManyToMany + @JoinTable：删除主表时，中间表自动清理！！！！！！！！
   */
  // async delete(id: number | string): Promise<void> {
  //   const numberId = typeof id === 'string' ? Number(id) : id;
  //   const user = await this.repository.findOne({
  //     where: { id: numberId },
  //     relations: ['roles'],
  //   });

  //   if (!user) {
  //     throw new NotFoundException(`Record with ID ${numberId} not found`);
  //   }

  //   // TypeORM ManyToMany 关系会在删除主实体时自动清理中间表
  //   // 直接删除即可，不需要手动清空 roles
  //   await this.repository.delete(numberId);
  // }
}
