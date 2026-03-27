import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ description: '用户名', example: 'user_ceshi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  // @ApiProperty({ description: '验证码', example: 'a8K2' })
  // @IsString()
  // @IsNotEmpty()
  // @MinLength(4)
  // @MaxLength(8)
  // captcha: string;
}