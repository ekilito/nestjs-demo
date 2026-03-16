import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptionalNumber,
  IsOptionalString,
} from '../decorators/validation-and-transform.decorators';
import { PageDto } from './page.dto';

export class UserPageDto extends PageDto {
  @ApiPropertyOptional({ description: '用户名', example: 'admin' })
  @IsOptionalString()
  username?: string;

  @ApiPropertyOptional({ description: '状态', example: 1 })
  @IsOptionalNumber()
  status?: number;

}
