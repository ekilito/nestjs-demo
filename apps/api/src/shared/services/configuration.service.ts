import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
// 对 NestJS 原生 ConfigService 的二次封装，用于获取应用配置
export class ConfigurationService {
  constructor(private configService: ConfigService) {
    // 注入 NestJS 的 ConfigService（用于读取 .env 文件）
    // 通过依赖注入获取配置服务实例
  }
  get mysqlHost(): string {
    return this.configService.get<string>('MYSQL_HOST') ?? '';
  }
  get mysqlPort(): number {
    return this.configService.get<number>('MYSQL_PORT') ?? 0;
  }
  get mysqlDb(): string {
    return this.configService.get<string>('MYSQL_DB') ?? '';
  }
  get mysqlUser(): string {
    return this.configService.get<string>('MYSQL_USER') ?? '';
  }
  get mysqlPass(): string {
    return this.configService.get<string>('MYSQL_PASS') ?? '';
  }
  get mysqlConfig() {
    return {
      host: this.mysqlHost,
      port: this.mysqlPort,
      database: this.mysqlDb,
      username: this.mysqlUser,
      password: this.mysqlPass,
    };
  }
}
