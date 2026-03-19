import { ApiProperty, PartialType as PartialTypeFromSwagger } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @ApiProperty({ description: '标签名称', example: 'tagName' })
  tagName: string;


  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ description: '状态', example: 1 })
  status: number;


  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ description: '排序号', example: 100 })
  sort: number;
}

export class UpdateTagDto extends PartialTypeFromSwagger(CreateTagDto) {
  @IsString()
  @ApiProperty({ description: 'ID', example: '12345678901234567890' })
  id: string;
}