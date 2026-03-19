import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { UpdateRoleAccessesDto } from '../dtos/role.dto';
import { Access } from '../entities/access.entity';

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
  async updateAccesses(id: number, updateRoleAccessesDto: UpdateRoleAccessesDto) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 查找角色
      const role = await queryRunner.manager.findOne(Role, {
        where: { id: String(id) },
        relations: ['accesses'],
      });

      if (!role) {
        throw new NotFoundException(`角色 ${id} 未找到`);
      }

      const { accessIds } = updateRoleAccessesDto;

      // 查询所有资源
      const accesses = await queryRunner.manager.findByIds(Access, accessIds);

      // 验证资源是否都找到了
      if (accesses.length !== accessIds.length) {
        const foundIds = accesses.map((a) => a.id);
        const invalidIds = accessIds.filter((aid) => !foundIds.includes(String(aid)));
        throw new BadRequestException(`无效的资源 ID: ${invalidIds.join(', ')}`);
      }

      // 为角色设置资源并保存
      role.accesses = accesses;
      await queryRunner.manager.save(role);

      await queryRunner.commitTransaction();
      return { success: true, message: '资源分配成功' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
