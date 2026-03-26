import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigurationService } from './configuration.service';
@Injectable()
export class RedisService implements OnModuleDestroy {
  private redisClient: Redis;
  constructor(
    private configurationService: ConfigurationService
  ) {
    this.redisClient = new Redis({
      host: this.configurationService.redisHost,
      port: this.configurationService.redisPort,
      password: this.configurationService.redisPassword
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  // 获取 Redis 客户端实例
  getClient(): Redis {
    return this.redisClient;
  }

  // 设置键值对，可选设置过期时间
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  // 获取键值对
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
