import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSettingDto, UpdateSettingDto } from '../../shared/dtos/setting.dto';
import { Setting } from '../../shared/entities/setting.entity';
import { SettingService } from '../../shared/services/setting.service';
import { Result } from '../../shared/vo/result';

@ApiTags('setting')
@SerializeOptions({ strategy: 'exposeAll' })
@UseInterceptors(ClassSerializerInterceptor)
@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @Post('create')
  @ApiOperation({ summary: '新增网站设置' })
  @ApiBody({ type: CreateSettingDto })
  @ApiResponse({ status: 200, description: '新增成功', type: Result })
  async create(@Body() createSettingDto: CreateSettingDto) {
    await this.settingService.create(createSettingDto);
    return Result.ok(null, 'success');
  }

  @Post('update')
  @ApiOperation({ summary: '修改网站设置' })
  @ApiBody({ type: UpdateSettingDto })
  @ApiResponse({ status: 200, description: '修改成功', type: Result })
  async update(@Body() updateSettingDto: UpdateSettingDto) {
    const { id, ...data } = updateSettingDto;
    await this.settingService.update(id, data);
    return Result.ok(null, 'success');
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除网站设置' })
  @ApiParam({ name: 'id', description: '网站设置 ID', type: String })
  @ApiResponse({ status: 200, description: '删除成功', type: Result })
  async delete(@Param('id') id: string) {
    await this.settingService.delete(id);
    return Result.ok(null, 'success');
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '网站设置详情' })
  @ApiParam({ name: 'id', description: '网站设置 ID', type: String })
  @ApiResponse({ status: 200, description: '成功返回网站设置详情', type: Setting })
  async detail(@Param('id') id: string) {
    return await this.settingService.getById(id);
  }
}
