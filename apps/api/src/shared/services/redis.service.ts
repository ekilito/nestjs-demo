import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigurationService } from './configuration.service';
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis; // ioredis 的客户端实例
  constructor(
    private configurationService: ConfigurationService
  ) {
    // 初始化 Redis 客户端（从配置里拿 Redis 地址、端口、密码，应用一启动，就创建一个 Redis 连接客户端）
    this.redisClient = new Redis({
      host: this.configurationService.redisHost,
      port: this.configurationService.redisPort,
      password: this.configurationService.redisPassword,
    });

    this.redisClient.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });
  }

  // 模块销毁时关闭 Redis 连接
  onModuleDestroy() {
    this.redisClient.quit();
  }

  // 获取 Redis 客户端实例
  getClient(): Redis {
    return this.redisClient;
  }

  // 设置键值对 
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

  // 检查键是否存在
  async exists(key: string): Promise<boolean> {
    // ioredis 的 exists 方法返回 1 表示存在，0 表示不存在，所以我们需要将结果转换为布尔值
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  // 删除键值对
  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
