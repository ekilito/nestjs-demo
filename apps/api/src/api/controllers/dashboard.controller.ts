import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../../shared/services/dashboard.service';


@Controller('dashboard')
@ApiTags('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService
  ) { }
  @Get('overview')
  @ApiOperation({ summary: '数据概览' })
  async dashboard() {
    return await this.dashboardService.getDashboardData();
  }
}
