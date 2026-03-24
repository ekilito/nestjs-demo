import { ApiProperty, ApiPropertyOptional, PartialType as PartialTypeFromSwagger } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsArray, IsEnum, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ArticleStateEnum } from '../enums/article.enum';
import { PageDto } from './page.dto';

export class CreateArticleDto {
  @IsString()
  @MaxLength(50, { message: '标题最多不能超过 50 个字' })
  @ApiProperty({ description: '标题', example: '文章标题' })
  title: string;

  @IsString()
  @ApiProperty({ description: '内容', example: '文章内容' })
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : value ? [String(value)] : [])
  @ApiPropertyOptional({ description: '分类 ID 数组', example: ['12345678901234567890', '12345678901234567891'] })
  categoryIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : value ? [String(value)] : [])
  @ApiPropertyOptional({ description: '标签 ID 数组', example: ['12345678901234567890', '12345678901234567891'] })
  tagIds?: string[];

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: '状态', example: 1 })
  status?: number;

  @IsEnum(ArticleStateEnum)
  @IsOptional()
  @ApiPropertyOptional({ description: '审核状态', example: ArticleStateEnum.DRAFT, enum: ArticleStateEnum })
  @Transform(({ value }) => ArticleStateEnum[value]) // 转换为枚举值
  state?: ArticleStateEnum;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: '审核不通过原因', example: '内容不合要求' })
  rejectionReason?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ description: '排序号', example: 100 })
  sort?: number;
}

export class UpdateArticleDto extends PartialTypeFromSwagger(CreateArticleDto) {
  @IsString()
  @ApiProperty({ description: 'ID', example: '12345678901234567890' })
  id: string;
}

export class ArticlePageDto extends PageDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: '标题', example: '文章标题' })
  title?: string;

  @IsEnum(ArticleStateEnum)
  @IsOptional()
  @ApiPropertyOptional({ description: '审核状态', example: ArticleStateEnum.DRAFT, enum: ArticleStateEnum })
  state?: ArticleStateEnum;
}

export class ArticleActionDto {
  @IsString()
  @ApiProperty({ description: 'ID', example: '12345678901234567890' })
  id: string;

  @IsEnum(ArticleStateEnum)
  action: ArticleStateEnum;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}