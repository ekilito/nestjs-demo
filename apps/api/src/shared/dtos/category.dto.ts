import { ApiProperty, PartialType as PartialTypeFromSwagger } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @ApiProperty({ description: '分类名称', example: 'categoryName' })
  categoryName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'parentId', example: '12345678901234567890' })
  parentId?: string;


  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ description: '生效状态', example: 1 })
  status: number;


  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ description: '排序号', example: 100 })
  sort: number;
}

export class UpdateCategoryDto extends PartialTypeFromSwagger(CreateCategoryDto) {
  @IsString()
  @ApiProperty({ description: 'ID', example: '12345678901234567890' })
  id: string;
}