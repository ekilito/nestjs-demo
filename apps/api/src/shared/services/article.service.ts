import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindManyOptions } from 'typeorm';
import { CreateArticleDto, UpdateArticleDto, ArticleActionDto } from '../dtos/article.dto';
import { Article } from '../entities/article.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { bindManyToManyRelation } from '../utils/comm';
import { ArticleStateEnum } from '../enums/article.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ArticleService extends MySQLBaseService<Article> {
  constructor(
    @InjectRepository(Article)
    protected repository: Repository<Article>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2, // 注入事件发射器
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

  async findList(
    keyword: string = '',
    categoryId: string = '',
    tagId: string = '',
  ): Promise<Article[]> {
    const qb = this.repository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.categories', 'category')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('article.status = :status', { status: 1 })
      .andWhere('article.state = :state', {
        state: ArticleStateEnum.PUBLISHED,
      })
      .orderBy('article.createdAt', 'DESC');

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      qb.andWhere(
        '(article.title LIKE :keyword OR article.content LIKE :keyword)',
        { keyword: `%${trimmedKeyword}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    if (tagId) {
      qb.andWhere('tag.id = :tagId', { tagId });
    }

    return await qb.getMany();
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

    // 绑定多对多关系
    await bindManyToManyRelation(categoryRepo, categoryIds, 'categories', entity);
    await bindManyToManyRelation(tagRepo, tagIds, 'tags', entity);

    const savedEntity = await this.repository.save(entity);

    // 如果文章状态是待审核，触发通知事件
    if (savedEntity.state === ArticleStateEnum.PENDING) {
      this.eventEmitter.emit('article.submitted', { articleId: savedEntity.id });
    }

    return savedEntity;
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
   * 不用 ManyToMany，而是中间表是"独立实体" 是需要的
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

  /**
   * 审核文章 - 修改状态
   * @param dto 审核 DTO
   * @returns 更新后的文章
   */
  async action(dto: ArticleActionDto): Promise<Article> {
    const { id, state, rejectionReason } = dto;

    // 查找文章
    const article = await this.repository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    // 验证状态转换的合法性
    const validTransitions = {
      [ArticleStateEnum.DRAFT]: [ArticleStateEnum.PENDING],
      [ArticleStateEnum.PENDING]: [ArticleStateEnum.PUBLISHED, ArticleStateEnum.REJECTED, ArticleStateEnum.WITHDRAWN],
      [ArticleStateEnum.PUBLISHED]: [ArticleStateEnum.WITHDRAWN],
      [ArticleStateEnum.REJECTED]: [ArticleStateEnum.DRAFT, ArticleStateEnum.PENDING],
      [ArticleStateEnum.WITHDRAWN]: [ArticleStateEnum.DRAFT, ArticleStateEnum.PENDING],
    };

    const currentState = article.state;
    const allowedNextStates = validTransitions[currentState] || [];

    if (!allowedNextStates.includes(state)) {
      throw new BadRequestException(
        `Invalid state transition from ${ArticleStateEnum[currentState]} to ${ArticleStateEnum[state]}`,
      );
    }

    // 如果是拒绝操作，需要填写拒绝原因
    if (state === ArticleStateEnum.REJECTED && !rejectionReason) {
      throw new BadRequestException('拒绝审核时必须填写拒绝原因');
    }

    // 更新状态
    article.state = state;

    // 如果是否决原因，保存拒绝原因；否则清空
    if (state === ArticleStateEnum.REJECTED) {
      article.rejectionReason = rejectionReason ?? '';
    } else {
      article.rejectionReason = '';
    }

    const updatedArticle = await this.repository.save(article);

    // 根据状态变化触发不同的事件
    if (currentState === ArticleStateEnum.PENDING) {
      if (state === ArticleStateEnum.PUBLISHED) {
        // 文章审核通过
        this.eventEmitter.emit('article.approved', { articleId: updatedArticle.id });
      } else if (state === ArticleStateEnum.REJECTED) {
        // 文章审核被拒绝
        this.eventEmitter.emit('article.rejected', { articleId: updatedArticle.id, reason: rejectionReason });
      }
    }

    return updatedArticle;
    //   用户创建文章 (状态=PENDING)
    //     ↓
    // 触发 article.submitted 事件
    //     ↓
    // 通知管理员审核

    // 管理员审核通过 (状态→PUBLISHED)
    //     ↓
    // 触发 article.approved 事件
    //     ↓
    // 通知作者审核结果

    // 管理员审核拒绝 (状态→REJECTED)
    //     ↓
    // 触发 article.rejected 事件
    //     ↓
    // 通知作者并附带拒绝原因
  }
}
