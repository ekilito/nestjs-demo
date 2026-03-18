import { ApiProperty, ApiPropertyOptional, PartialType as PartialTypeFromSwagger } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { PageDto } from './page.dto';

export enum AccessType {
  MODULE = 'module',
  MENU = 'menu',
  FEATURE = 'feature',
}

export class CreateAccessDto {
  @IsString()
  @ApiProperty({ description: '资源名称', example: 'accessName' })
  accessName: string;

  @ApiProperty({ description: '类型', example: 'module' }) // 类型，module、menu、feature
  @IsEnum(AccessType)
  type: AccessType;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'url地址', example: 'admin/users' })
  url?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'parentID', example: '12345678901234567890' })
  parentId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '描述', example: 'accessDescription' })
  description?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ description: '状态', example: 1 })
  status: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ description: '排序号', example: 100, required: false })
  sort: number;
}

export class UpdateAccessDto extends PartialTypeFromSwagger(CreateAccessDto) {
  @IsString()
  @ApiProperty({ description: 'ID', example: '12345678901234567890' })
  id: string;
}

export class AccessPageDto extends PageDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: '资源名称', example: 'accessName' })
  accessName?: string;
}

// Create DTO：
//   必填 → 不加 ? + ApiProperty
//   可选 → ? + IsOptional + ApiPropertyOptional

// Update DTO：
//   直接 PartialType

// Page DTO：
//   全部可选（? + IsOptional）
//   并在 Swagger 中标记为可选（@ApiPropertyOptional）