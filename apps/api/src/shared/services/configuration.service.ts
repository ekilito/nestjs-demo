import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService) { }
  get mysqlHost(): string {
    return this.configService.getOrThrow<string>('MYSQL_HOST');
  }
  get mysqlPort(): number {
    const v = this.configService.getOrThrow<string>('MYSQL_PORT');
    const n = Number(v);
    if (Number.isNaN(n)) {
      throw new Error('MYSQL_PORT must be a number');
    }
    return n;
  }
  get mysqlDb(): string {
    return this.configService.getOrThrow<string>('MYSQL_DB');
  }
  get mysqlUser(): string {
    return this.configService.getOrThrow<string>('MYSQL_USER');
  }
  get mysqlPass(): string {
    return this.configService.getOrThrow<string>('MYSQL_PASS');
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
