import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService extends MySQLBaseService<Category> {
  constructor(
    @InjectRepository(Category)
    protected repository: Repository<Category>,
    @InjectDataSource()
    private readonly dataSource: DataSource, // 注入数据源
  ) {
    super(repository);
  }

  async getTree(): Promise<any[]> {
    const trees = await this.dataSource.getTreeRepository(Category).findTrees(); // 获取树 没有 parentId
    // 给每个节点加 parentId
    const attachParentId = (
      nodes: Category[],
      parentId: string | null,
    ): any[] => {
      return (nodes ?? []).map((node) => {
        return {
          ...(node as any),
          parentId,
          children: attachParentId(node.children ?? [], node.id),
        };
      });
    };
    return attachParentId(trees, null);
  }

  async getDetailById(id: string): Promise<Category> {
    const category = await this.repository.findOne({
      where: { id },
      // 关联查询 父级 子级 
      relations: {
        parent: true,
        children: true,
      },
    });
    if (!category) throw new NotFoundException(`Record with ID ${id} not found`);
    return category;
  }

  async create(data: any): Promise<Category> {
    if (Array.isArray(data)) {
      throw new BadRequestException('payload must be an object');
    }

    const payload = { ...(data ?? {}) } as Record<string, unknown>; // 深拷贝 防止修改原数据
    // 提取 parentId
    const parentId = payload.parentId;
    delete payload.parentId; // 删除 parentId 防止关联查询时出错

    const entity = this.repository.create(payload as DeepPartial<Category>); // 创建实体
    if (typeof parentId === 'string' && parentId) {
      // 处理 parent（核心）
      const parent = await this.repository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Record with ID ${parentId} not found`);
      }
      entity.parent = parent;
    } else {
      (entity.parent as any) = null;
    }

    return await this.repository.save(entity);
  }

  async update(id: number | string, data: any): Promise<Category> {
    const stringId = String(id);
    const entity = await this.repository.findOne({ // 查询实体 查旧数据
      where: { id: stringId },
      relations: { parent: true },
    });
    if (!entity) {
      throw new NotFoundException(`Record with ID ${stringId} not found`);
    }
    // 提取 parentId
    const dto = { ...(data ?? {}) } as Record<string, unknown>;
    const parentId = dto.parentId;
    delete dto.parentId;

    // 处理 parent（核心）
    if (parentId !== undefined) {
      if (parentId === null || parentId === '') {
        (entity.parent as any) = null;
      } else if (typeof parentId === 'string') {
        if (parentId === stringId) {
          throw new BadRequestException('parentId cannot be self');
        }
        const parent = await this.repository.findOne({
          where: { id: parentId },
        });
        if (!parent) {
          throw new NotFoundException(`Record with ID ${parentId} not found`);
        }
        entity.parent = parent;
      } else {
        throw new BadRequestException('parentId must be string');
      }
    }

    Object.assign(entity, dto);
    return await this.repository.save(entity);
  }
}
