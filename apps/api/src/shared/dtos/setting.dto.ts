import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSettingDto {
  @ApiProperty({ description: '网站名称', example: '我的网站' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  siteName: string;

  @ApiProperty({ description: '网站描述', example: '这是我的个人网站' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  siteDescription: string;

  @ApiProperty({ description: '联系邮箱', example: 'contact@example.com' })
  @IsEmail({})
  @IsNotEmpty()
  contactEmail: string;
}

export class UpdateSettingDto extends PartialType(CreateSettingDto) {
  @ApiProperty({ description: '网站设置 ID', example: '12345678901234567890' })
  @IsString()
  @IsNotEmpty()
  id: string;
}
