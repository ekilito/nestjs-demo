import {
  Controller,
  UseFilters,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Get,
  Body,
  Post,
  Delete,
  Param,
  Header,
  NotFoundException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminExceptionFilter } from '../filters/exception.filter';
import {
  CreateArticleDto,
  ArticlePageDto,
  UpdateArticleDto,
  ArticleActionDto,
} from '../../shared/dtos/article.dto';
import { Result } from '../../shared/vo/result';
import { ArticleService } from '../../shared/services/article.service';
import { Article } from '../../shared/entities/article.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WordExportService } from '../../shared/services/word-export.service';

@ApiTags('Article')
@SerializeOptions({ strategy: 'exposeAll' }) // 序列化选项 - 暴露所有属性
@UseInterceptors(ClassSerializerInterceptor) // 类序列化拦截器 - 用于序列化响应数据
@UseFilters(AdminExceptionFilter) // 异常过滤器 - 用于处理异常情况
@Controller('article') // 控制器路由前缀 - /article
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService, // 注入文章服务
    private readonly eventEmitter: EventEmitter2, // 注入事件发射器
    private readonly wordExportService: WordExportService, // 注入 Word 导出服务
  ) { }

  @Post('page')
  @ApiOperation({ summary: '文章分页' })
  @ApiBody({ type: ArticlePageDto })
  @ApiResponse({
    status: 200,
    description: '成功返回文章分页列表',
    type: [Article],
  })
  async getPage(@Body() pageDto: ArticlePageDto) {
    const { pageNum = 1, pageSize = 10, ...query } = pageDto;
    return await this.articleService.getPageByQuery(pageNum, pageSize, query);
  }

  @Post('create')
  @ApiOperation({ summary: '新增文章' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({ status: 200, description: '成功创建文章', type: Result })
  async create(@Body() createArticleDto: CreateArticleDto) {
    await this.articleService.create(createArticleDto);
    return null;
  }

  @Post('update')
  @ApiOperation({ summary: '编辑文章' })
  @ApiBody({ type: UpdateArticleDto })
  @ApiResponse({ status: 200, description: '成功更新文章', type: Result })
  async update(@Body() updateArticleDto: UpdateArticleDto) {
    const { id, ...rest } = updateArticleDto;
    await this.articleService.update(id, updateArticleDto);
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除文章' })
  @ApiParam({ name: 'id', description: '文章 ID', type: String })
  @ApiResponse({ status: 200, description: '成功删除文章', type: Result })
  async delete(@Param('id') id: string) {
    await this.articleService.deleteWithRelations(id);
    return null;
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '文章详情' })
  @ApiParam({ name: 'id', description: '文章 ID', type: String })
  @ApiResponse({ status: 200, description: '成功返回文章详情', type: Article })
  async getDetail(@Param('id') id: string) {
    return await this.articleService.getDetailById(id);
  }

  // 审核
  @Post('action')
  @ApiOperation({ summary: '修改状态' })
  @ApiBody({ type: ArticleActionDto })
  @ApiResponse({ status: 200, description: '成功修改文章状态', type: Article })
  async changeState(@Body() dto: ArticleActionDto) {
    return await this.articleService.action(dto);
  }

  // 导出word
  @Get(':id/export-word')
  @ApiOperation({ summary: '导出文章为 Word 文档' })
  @ApiParam({ name: 'id', description: '文章 ID', type: String })
  @ApiResponse({
    status: 200,
    description: '成功导出 Word 文档',
    content: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {},
    },
  })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  async exportWord(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const article = await this.articleService.findOne({
      where: { id },
      relations: ['categories', 'tags'],
    });

    if (!article) throw new NotFoundException('Article not found');

    // 将枚举状态转换为中文
    const stateMap = {
      0: '草稿',
      1: '待审核',
      2: '已发布',
      3: '已拒绝',
      4: '已撤回',
    };

    const htmlContent = `
      <h1 style="font-size: 24px; margin-bottom: 20px;">${article.title}</h1>
      <div style="margin-bottom: 15px;">
        <p><strong>状态:</strong> ${stateMap[article.state] || '未知'}</p>
        <p><strong>分类:</strong> ${article.categories.map(c => c.categoryName).join(', ') || '无'}</p>
        <p><strong>标签:</strong> ${article.tags.map(t => t.tagName).join(', ') || '无'}</p>
        <p><strong>创建时间:</strong> ${new Date(article.createdAt).toLocaleString('zh-CN')}</p>
        <p><strong>更新时间:</strong> ${new Date(article.updatedAt).toLocaleString('zh-CN')}</p>
      </div>
      <hr style="margin: 20px 0;"/>
      <div style="line-height: 1.8;">
        ${article.content || ''}
      </div>
    `;

    const buffer = await this.wordExportService.exportToWord(htmlContent);

    // 设置文件名并处理中文
    const fileName = `${article.title}.docx`;
    const encodedFileName = encodeURIComponent(fileName).replace(/'/g, '%27');

    res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
    return new StreamableFile(buffer);
  }
}