import { IsString, Validate } from 'class-validator';
import { PasswordValidators, IsOptionalString, EmailValidators, IsOptionalNumber, IsOptionalBoolean } from '../decorators/validation-and-transform.decorators';
import { IsUsernameUnique, StartsWith, StartsWithConstraint } from '../validators/user-validators';

export class CreateUserDto {

  @IsString()
  // 自定义校验器（同步），两种方式都可以
  // @Validate(StartsWithConstraint, ['user_'], {message: `Username must start with "user_".`,})
  @StartsWith('user_', { message: `Username must start with "user_".` })
  // 自定义异步验证器
  @IsUsernameUnique({ message: `Username must be unique.` })
  readonly username: string;

  @PasswordValidators()
  readonly password: string;

  @IsOptionalString()
  readonly mobile?: string;

  @EmailValidators()
  readonly email?: string;

  @IsOptionalNumber()
  readonly status?: number;

  @IsOptionalBoolean()
  readonly is_super?: boolean;
}

export class UpdateUserDto extends CreateUserDto {
  @IsOptionalNumber()
  readonly id: number;
}
