import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Access } from '../entities/access.entity';

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
    const trees = await this.dataSource.getTreeRepository(Access).findTrees();
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

  async getDetailById(id: string): Promise<Access> {
    const access = await this.repository.findOne({
      where: { id },
      relations: {
        parent: true,
        children: true,
      },
    });
    if (!access) throw new NotFoundException(`Record with ID ${id} not found`);
    return access;
  }

  async create(data: any): Promise<Access> {
    if (Array.isArray(data)) {
      throw new BadRequestException('payload must be an object');
    }

    const payload = { ...(data ?? {}) } as Record<string, unknown>;
    const parentId = payload.parentId;
    delete payload.parentId;

    const entity = this.repository.create(payload as DeepPartial<Access>);
    if (typeof parentId === 'string' && parentId) {
      const parent = await this.repository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Record with ID ${parentId} not found`);
      }
      entity.parent = parent;
    } else {
      entity.parent = null;
    }

    return await this.repository.save(entity);
  }

  async update(id: number | string, data: any): Promise<Access> {
    const stringId = String(id);
    const entity = await this.repository.findOne({
      where: { id: stringId },
      relations: { parent: true },
    });
    if (!entity) {
      throw new NotFoundException(`Record with ID ${stringId} not found`);
    }

    const dto = { ...(data ?? {}) } as Record<string, unknown>;
    const parentId = dto.parentId;
    delete dto.parentId;

    if (parentId !== undefined) {
      if (parentId === null || parentId === '') {
        entity.parent = null;
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
