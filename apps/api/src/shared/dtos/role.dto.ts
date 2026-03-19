import { ApiProperty, ApiPropertyOptional, PartialType as PartialTypeFromSwagger } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { PageDto } from './page.dto';

export class CreateRoleDto {
  @IsString()
  @ApiProperty({ description: '名称', example: 'name' })
  name: string;

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

export class UpdateRoleDto extends PartialTypeFromSwagger(CreateRoleDto) {
  @IsNumber()
  @ApiProperty({ description: 'ID', example: 1 })
  id: number;
}

export class RolePageDto extends PageDto {
  @IsString()
  @IsOptional() // 运行时验证	class-validator 验证时跳过空值！！！
  // Swagger 中标记为可选
  @ApiPropertyOptional({ description: '名称', example: 'name' })
  name: string;
}

export class UpdateRoleAccessesDto {
  @ApiProperty({ description: '角色 ID', example: 1 })
  @IsNumber()
  readonly roleId: number;

  @ApiProperty({ description: '资源 ID 数组', example: ['12345678901234567890', '12345678901234567891'] })
  @IsArray()
  @IsString({ each: true }) // 每个元素必须是字符串
  @IsNotEmpty({ message: '资源 ID 数组不能为空' })
  @ArrayMinSize(1, { message: '至少需要一个资源' })
  readonly accessIds: string[];
}