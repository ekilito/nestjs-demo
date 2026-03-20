import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateAccessDto, UpdateAccessDto } from '../dtos/access.dto';
import { Access } from '../entities/access.entity';
import { resolveParent } from '../utils/comm';

@Injectable()
export class AccessService extends MySQLBaseService<Access> {
  constructor(
    @InjectRepository(Access)
    protected repository: Repository<Access>,
    @InjectDataSource()
    private readonly dataSource: DataSource, // 注入数据源
  ) {
    super(repository);
  }

  async getTree(): Promise<any[]> {
    const trees = await this.dataSource.getTreeRepository(Access).findTrees(); // 获取树 没有 parentId
    // 给每个节点加 parentId
    const attachParentId = (
      nodes: Access[],
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



  async create(data: CreateAccessDto): Promise<Access> {
    // 验证数据
    if (Array.isArray(data)) {
      throw new BadRequestException('payload must be an object');
    }

    const { parentId, ...payload } = data;

    const entity = this.repository.create(payload);

    // 处理父级关联
    const accessRepo = this.dataSource.getRepository(Access);
    const parent = await resolveParent(accessRepo, parentId);
    if (parent !== undefined) {
      entity.parent = parent;
    }

    return await this.repository.save(entity);
  }

  async update(id: string, data: UpdateAccessDto): Promise<Access> {
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
    const accessRepo = this.dataSource.getRepository(Access); // this.repository
    const parent = await resolveParent(accessRepo, parentId, id);
    if (parent !== undefined) {
      entity.parent = parent;
    }

    Object.assign(entity, payload);

    return await this.repository.save(entity);
  }

  async getDetailById(id: string): Promise<Access> {
    const access = await this.repository.findOne({
      where: { id },
      // 关联查询 父级 子级 
      relations: {
        parent: true,
        children: true,
      },
    });
    if (!access) throw new NotFoundException(`Record with ID ${id} not found`);
    return access;
  }
}
