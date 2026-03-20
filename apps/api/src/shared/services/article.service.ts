import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindManyOptions } from 'typeorm';
import { CreateArticleDto, UpdateArticleDto } from '../dtos/article.dto';
import { Article } from '../entities/article.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { bindManyToManyRelation } from '../utils/comm';

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

  async create(data: CreateArticleDto): Promise<Article> {
    // 验证数据
    if (Array.isArray(data)) {
      throw new BadRequestException('payload must be an object');
    }

    const payload = { ...(data ?? {}) };
    const { categoryIds, tagIds, ...rest } = payload;

    const entity = this.repository.create(rest);

    // 处理分类关联 
    const categoryRepo = this.dataSource.getRepository(Category); // 拿到 Category 实体对应的 Repository
    const tagRepo = this.dataSource.getRepository(Tag);

    await bindManyToManyRelation(categoryRepo, categoryIds, 'categories', entity);
    await bindManyToManyRelation(tagRepo, tagIds, 'tags', entity);

    return await this.repository.save(entity);
  }

  async update(id: string, data: UpdateArticleDto): Promise<Article> {
    // 验证数据
    const entity = await this.repository.findOne({
      where: { id },
      relations: {
        categories: true,
        tags: true,
      },
    });

    if (!entity) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    const { categoryIds, tagIds, ...rest } = data ?? {};

    const categoryRepo = this.dataSource.getRepository(Category);
    const tagRepo = this.dataSource.getRepository(Tag);

    await bindManyToManyRelation(categoryRepo, categoryIds, 'categories', entity);
    await bindManyToManyRelation(tagRepo, tagIds, 'tags', entity);

    Object.assign(entity, rest);

    return await this.repository.save(entity);
  }

  /**
   * 删除文章及关联关系
   * @param id
   * 🙅
   * 中间表（categories / tags）会自动删除
   * 不用 ManyToMany，而是中间表是“独立实体” 是需要的
   */
  async deleteWithRelations(id: string): Promise<void> {
    const article = await this.repository.findOne({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    // TypeORM 会自动删除中间表记录，直接删除即可
    await this.repository.delete(id);
  }
}
