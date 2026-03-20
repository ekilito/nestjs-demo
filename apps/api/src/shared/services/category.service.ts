import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';
import { resolveParent } from '../utils/comm';
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


  async create(data: CreateCategoryDto): Promise<Category> {
    // 验证数据
    if (Array.isArray(data)) {
      throw new BadRequestException('payload must be an object');
    }

    const { parentId, ...payload } = data;

    const entity = this.repository.create(payload);

    // 处理父级关联
    const categoryRepo = this.dataSource.getRepository(Category);
    const parent = await resolveParent(categoryRepo, parentId);
    if (parent !== undefined && parent !== null) {
      entity.parent = parent;
    }

    return await this.repository.save(entity);
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    // 验证数据
    const entity = await this.repository.findOne({
      where: { id },
      relations: { parent: true },
    });

    if (!entity) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    const { parentId, ...payload } = data;

    // 处理父级关联
    const categoryRepo = this.dataSource.getRepository(Category);
    const parent = await resolveParent(categoryRepo, parentId, id);
    if (parent !== undefined && parent !== null) {
      entity.parent = parent;
    } else if (parent === null) {
      (entity as any).parent = null;
    }

    Object.assign(entity, payload);

    return await this.repository.save(entity);
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
}
