import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../../shared/services/dashboard.service';
import { WeatherService } from '../../shared/services/weather.service';


@Controller('dashboard')
@ApiTags('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly weatherService: WeatherService,
  ) { }
  @Get('overview')
  @ApiOperation({ summary: '数据概览' })
  async dashboard() {
    return await this.dashboardService.getDashboardData();
  }

  @Get('/weather')
  @ApiOperation({ summary: '天气预报' })
  async getWeather() {
    const weather = await this.weatherService.getWeather();
    return { weather };
  }
}
