import { Controller, Get, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../../shared/services/dashboard.service';
import { WeatherService } from '../../shared/services/weather.service';
import { SystemService } from '../../shared/services/system.service';
import { interval, map, mergeMap } from 'rxjs';


@Controller('dashboard')
@ApiTags('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly weatherService: WeatherService,
    private readonly systemService: SystemService,
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
  @Sse('/systemInfo')
  @ApiOperation({ summary: '系统信息' })
  systemInfo() {
    return interval(3000).pipe(
      mergeMap(() => this.systemService.getSystemInfo()),
      map((systemInfo) => ({ data: systemInfo }))
    );
  }
}
