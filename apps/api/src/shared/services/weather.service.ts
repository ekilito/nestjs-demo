import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import geoip from 'geoip-lite';

@Injectable()
export class WeatherService {
  constructor(private readonly configService: ConfigService) { }

  private getConfigOrThrow(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing config: ${key}`);
    }
    return value;
  }

  async getExternalIP() {
    try {
      const ipApiUrl = this.configService.get<string>('IP_API_URL');
      if (!ipApiUrl) {
        return 'auto:ip';
      }
      const response = await axios.get(ipApiUrl);
      return response.data.ip;
    } catch (error: unknown) {
      console.error('Error fetching external IP:', error);
      return 'auto:ip';
    }
  }

  async getWeather() {
    const ip = await this.getExternalIP();
    const geo = geoip.lookup(ip);
    const location = geo ? `${geo.city}, ${geo.country}` : ip;
    let weather = '无法获取天气信息';
    try {
      const apiKey = this.getConfigOrThrow('WEATHER_API_KEY');
      const weatherApiUrl = this.getConfigOrThrow('WEATHER_API_URL');
      const query = location || 'auto:ip';
      const response = await axios.get(
        `${weatherApiUrl}?lang=zh&key=${apiKey}&q=${query}`,
      );
      weather = `${response.data.current.temp_c}°C, ${response.data.current.condition.text}`;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('获取天气信息失败:', message);
    }
    return weather;
  }
}
