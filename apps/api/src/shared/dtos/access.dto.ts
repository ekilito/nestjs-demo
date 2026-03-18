import { ApiProperty, ApiPropertyOptional, PartialType as PartialTypeFromSwagger } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { PageDto } from './page.dto';

export class CreateAccessDto {
  @IsString()
  @ApiProperty({ description: '资源名称', example: 'accessName' })
  accessName: string;

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
  accessName: string;
}