import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptionalNumber } from '../decorators/validation-and-transform.decorators';

export class PageDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptionalNumber()
  @Type(() => Number)
  pageNum?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 10, default: 10 })
  @IsOptionalNumber()
  @Type(() => Number)
  pageSize?: number;
}
