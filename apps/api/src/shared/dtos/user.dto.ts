import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  PasswordValidators,
  IsOptionalString,
  EmailValidators,
  IsOptionalNumber,
  IsOptionalBoolean,
} from '../decorators/validation-and-transform.decorators';
import { PageDto } from './page.dto';
import { IsUsernameUnique, StartsWith } from '../validators/user-validators';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'; // 请求示例文档
import { Type } from 'class-transformer';
// import { PartialType } from '@nestjs/mapped-types';
// ApiProperty: 用于描述 DTO 类中的属性，生成 Swagger 文档时使用 (description: 描述, example: 示例)
// ApiPropertyOptional: 用于描述可选属性，生成 Swagger 文档时使用
// PartialType: 用于创建一个部分类型的 DTO 类，继承自原始类，用于更新操作

export class CreateUserDto {
  @ApiProperty({
    description: '用户名，必须唯一且以指定前缀开头',
    example: 'user_john_doe',
  })
  @IsString()
  // 自定义校验器（同步），两种方式都可以
  // @Validate(StartsWithConstraint, ['user_'], {message: `Username must start with "user_".`,})
  @StartsWith('user_', { message: `Username must start with "user_".` })
  // 自定义异步验证器
  @IsUsernameUnique({ message: `Username must be unique.` })
  readonly username: string;

  @ApiProperty({ description: '密码', example: 'securePassword123' })
  @PasswordValidators()
  readonly password: string;

  @ApiPropertyOptional({ description: '手机号', example: '1234567890' })
  @IsOptionalString()
  readonly mobile?: string;

  @ApiPropertyOptional({
    description: '邮箱地址',
    example: 'john.doe@example.com',
  })
  @EmailValidators()
  readonly email?: string;

  @ApiPropertyOptional({ description: '用户状态', example: 1, default: 1 })
  @IsOptionalNumber()
  readonly status?: number;

  @ApiPropertyOptional({
    description: '是否为超级管理员',
    example: true,
    default: false,
  })
  @IsOptionalBoolean()
  readonly is_super?: boolean;

  @ApiPropertyOptional({ description: '排序编号', example: 100, default: 100 })
  @IsOptionalNumber()
  readonly sort?: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: '用户ID', example: 1 })
  @Type(() => Number)
  @IsNumber()
  readonly id: number;
}

export class UserPageDto extends PageDto {
  @ApiPropertyOptional({ description: '用户名', example: 'admin' })
  @IsOptionalString()
  username?: string;

  @ApiPropertyOptional({ description: '状态', example: 1 })
  @IsOptionalNumber()
  status?: number;

}

export class UpdateUserRolesDto {
  @ApiProperty({ description: '用户 ID', example: 1 })
  @IsNumber()
  readonly userId: number; // 作用是接收前端参数 - 与数据库字段无关

  @ApiProperty({ description: '角色 ID 数组', example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true }) // 每个元素必须是数字
  @IsNotEmpty({ message: '角色 ID 数组不能为空' }) // ✅ 非空验证
  @ArrayMinSize(1, { message: '至少需要一个角色' }) // ✅ 最小长度验证
  readonly roleIds: number[];
}