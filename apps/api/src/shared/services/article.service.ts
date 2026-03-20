import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindManyOptions } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Article } from '../entities/article.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class ArticleService extends MySQLBaseService<Article> {
  constructor(
    @InjectRepository(Article)
    protected repository: Repository<Article>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super(repository);
  }

  /**
   * 重写分页查询，默认关联分类和标签
   */
  async getPageByQuery(
    pageNum: number = 1,
    pageSize: number = 10,
    query?: Record<string, any>,
  ): Promise<{
    records: Article[];
    total: number;
    size: number;
    pages: number;
  }> {
    return await super.getPageByQuery(pageNum, pageSize, query, ['categories', 'tags']);
  }

  async getDetailById(id: string): Promise<Article> {
    const article = await this.repository.findOne({
      where: { id },
      // 关联查询分类和标签
      relations: {
        categories: true,
        tags: true,
      },
    });
    if (!article) throw new NotFoundException(`Record with ID ${id} not found`);
    return article;
  }

  async create(data: any): Promise<Article> {
    if (Array.isArray(data)) {
      throw new BadRequestException('payload must be an object');
    }

    const payload = { ...(data ?? {}) } as Record<string, unknown>;
    // 提取 categoryIds 和 tagIds
    const categoryIds = payload.categoryIds;
    const tagIds = payload.tagIds;
    delete payload.categoryIds;
    delete payload.tagIds;

    const entity = this.repository.create(payload as DeepPartial<Article>);

    // 处理分类关联
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      const categories = await this.dataSource.getRepository(Category).findByIds(categoryIds);
      if (categories.length !== categoryIds.length) {
        throw new NotFoundException('Some categories not found');
      }
      entity.categories = categories;
    } else {
      entity.categories = [];
    }

    // 处理标签关联
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const tags = await this.dataSource.getRepository(Tag).findByIds(tagIds);
      if (tags.length !== tagIds.length) {
        throw new NotFoundException('Some tags not found');
      }
      entity.tags = tags;
    } else {
      entity.tags = [];
    }

    return await this.repository.save(entity);
  }

  async update(id: number | string, data: any): Promise<Article> {
    const stringId = String(id);
    const entity = await this.repository.findOne({
      where: { id: stringId },
      relations: {
        categories: true,
        tags: true,
      },
    });
    if (!entity) {
      throw new NotFoundException(`Record with ID ${stringId} not found`);
    }

    const dto = { ...(data ?? {}) } as Record<string, unknown>;
    const categoryIds = dto.categoryIds;
    const tagIds = dto.tagIds;
    delete dto.categoryIds;
    delete dto.tagIds;

    // 处理分类关联
    if (categoryIds !== undefined) {
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        const categories = await this.dataSource.getRepository(Category).findByIds(categoryIds);
        if (categories.length !== categoryIds.length) {
          throw new NotFoundException('Some categories not found');
        }
        entity.categories = categories;
      } else {
        entity.categories = [];
      }
    }

    // 处理标签关联
    if (tagIds !== undefined) {
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        const tags = await this.dataSource.getRepository(Tag).findByIds(tagIds);
        if (tags.length !== tagIds.length) {
          throw new NotFoundException('Some tags not found');
        }
        entity.tags = tags;
      } else {
        entity.tags = [];
      }
    }

    Object.assign(entity, dto);
    return await this.repository.save(entity);
  }

  async deleteWithRelations(id: string): Promise<void> {
    const article = await this.repository.findOne({
      where: { id },
      relations: {
        categories: true,
        tags: true,
      },
    });
    if (!article) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    // 清空关联关系后删除
    article.categories = [];
    article.tags = [];
    await this.repository.save(article);
    await this.repository.delete(id);
  }
}
