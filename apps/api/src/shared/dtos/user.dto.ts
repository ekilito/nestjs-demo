import { IsString, Validate } from 'class-validator';
import { PasswordValidators, IsOptionalString, EmailValidators, IsOptionalNumber, IsOptionalBoolean } from '../decorators/validation-and-transform.decorators';

export class CreateUserDto {

  @IsString()
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
