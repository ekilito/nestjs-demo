import { In, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export async function bindManyToManyRelation<T extends object>(
  repo: Repository<T>,
  ids: any[] | undefined,
  relationName: keyof any,
  entity: any,
) {
  // 👇 不传 = 不更新（update 场景用）
  if (ids === undefined) return;

  // 👇 传空数组 = 清空关系
  if (!Array.isArray(ids) || ids.length === 0) {
    entity[relationName] = [];
    return;
  }

  const list = await repo.findBy({
    id: In(ids),
  } as any);

  if (list.length !== ids.length) {
    const foundIds = list.map((item: any) => String(item.id));
    const invalidIds = ids.filter((id) => !foundIds.includes(String(id)));
    throw new NotFoundException(
      `${String(relationName)} invalid ids: ${invalidIds.join(', ')}`,
    );
  }

  entity[relationName] = list;
}

export async function resolveParent<T extends object>(
  repo: Repository<T>,
  parentId?: string,
  selfId?: string,
): Promise<T | null | undefined> {
  if (parentId === undefined) return undefined;

  if (parentId === null || parentId === '') {
    return null;
  }

  if (typeof parentId !== 'string') {
    throw new BadRequestException('parentId must be string');
  }

  if (selfId && parentId === selfId) {
    throw new BadRequestException('parentId cannot be self');
  }

  const parent = await repo.findOne({
    where: { id: parentId } as any,
  });

  if (!parent) {
    throw new NotFoundException(`Record with ID ${parentId} not found`);
  }

  return parent;
}

export async function updateEntityRelations<
  T extends { id: any;[key: string]: any },
  R extends { id: any }
>(
  manager: any,                    // TypeORM 的 EntityManager
  entityClass: { new(): T },        // 实体类，比如 User 或 Role
  entityId: number | string,         // 实体 ID
  relationKey: keyof T,              // 关系字段名，比如 'roles' 或 'accesses'
  relationClass: { new(): R },      // 关系实体类，比如 Role 或 Access
  relationIds: Array<number | string>, // 要关联的 ID 列表
  entityNotFoundMsg?: string,        // 实体未找到的错误信息
  relationNotFoundMsg?: string       // 关联实体未找到的错误信息
): Promise<{ success: boolean; message: string }> {
  const queryRunner = manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 查找实体
    const entity = await queryRunner.manager.findOne(entityClass, {
      where: { id: String(entityId) },
      relations: [relationKey as string],
    });

    if (!entity) {
      throw new NotFoundException(entityNotFoundMsg || `${entityClass.name} ${entityId} 未找到`);
    }

    // 查询关联实体
    const relations = await queryRunner.manager.findByIds(relationClass, relationIds);

    // 校验是否都找到了
    if (relations.length !== relationIds.length) {
      const foundIds = relations.map((r) => String(r.id));
      const invalidIds = relationIds.filter((rid) => !foundIds.includes(String(rid)));
      throw new BadRequestException(relationNotFoundMsg || `无效的 ${relationClass.name} ID: ${invalidIds.join(', ')}`);
    }

    // 更新关系并保存
    (entity as any)[relationKey] = relations;
    await queryRunner.manager.save(entity);

    await queryRunner.commitTransaction();
    return { success: true, message: `${String(relationKey)} 更新成功` };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}