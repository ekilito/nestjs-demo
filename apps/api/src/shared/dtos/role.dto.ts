import { ApiProperty, ApiPropertyOptional, PartialType as PartialTypeFromSwagger } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
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
  @ApiProperty({ description: '排序号', example: 100 })
  sort: number;
}

export class UpdateRoleDto extends PartialTypeFromSwagger(PartialType(CreateRoleDto)) {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'ID', example: 1 })
  id: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '用户名', example: 'nick' })
  username: string;

  @ApiProperty({ description: '密码', example: '666666' })
  @IsOptional()
  password: string;
}

export class RolePageDto extends PageDto {
  @IsString()
  @IsOptional() // 运行时验证	class-validator 验证时跳过空值！！！
  // Swagger 中标记为可选
  @ApiPropertyOptional({ description: '名称', example: 'name' })
  name: string;
}