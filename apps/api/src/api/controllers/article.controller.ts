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
  BadRequestException,
  Res,
  StreamableFile,
  UseGuards,
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

  // 导出 word
  @Post('exportWord')
  @ApiOperation({ summary: '导出 Word' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '文章 ID',
          example: '12345678901234567890',
        },
      },
      required: ['id'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '成功导出 Word 文档',
    content: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {},
    },
  })
  // 设置响应头
  // application：二进制文件 vnd.openxmlformats：微软 OpenXML 格式 wordprocessingml：word 文档 document: 文档
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  async exportWord(@Body('id') id: string, @Res() res: Response) {
    if (!id) {
      throw new BadRequestException('文章 ID 不能为空');
    }

    const article = await this.articleService.findOne({
      where: { id },
      relations: ['categories', 'tags'], // 关联分类和标签
    });

    if (!article) throw new NotFoundException('Article not found');

    const htmlContent = `
           <h1>${article.title}</h1>
           <p><strong>状态:</strong> ${article.state}</p>
           <p><strong>分类:</strong> ${article.categories.map(c => c.categoryName).join(', ') || '无'}</p>
           <p><strong>标签:</strong> ${article.tags.map(t => t.tagName).join(', ') || '无'}</p>
           <hr/>
           ${article.content}
       `;
    // 把 HTML 内容转换为 Word 文档的二进制数据
    const buffer = await this.wordExportService.exportToWord(htmlContent);

    // 设置文件名并处理中文
    // 设置响应头 - Content-Disposition: 用于指定文件名和是否下载
    // attachment: 表示文件作为附件下载 filename: 指定文件名 filename*: UTF-8 编码的文件名
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`${article.title}.docx`)}`);
    console.log('设置的 Content-Disposition:', res.getHeader('Content-Disposition'));
    res.send(buffer); // ✅ 直接使用 res.send 发送，绕过拦截器
  }
}