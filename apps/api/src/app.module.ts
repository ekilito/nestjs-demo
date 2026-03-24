import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { SharedModule } from './shared/shared.module';
import { LoggerModule } from './logger/logger.module';
import {
  I18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    // 配置 EventEmitterModule 模块
    EventEmitterModule.forRoot({
      wildcard: true,  // 启用通配符功能，允许使用通配符来订阅事件
      delimiter: '.', // 设置事件名的分隔符，这里使用 '.' 作为分隔符
      global: true  // 将事件发射器设置为全局模块，所有模块都可以共享同一个事件发射器实例
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'),
      // rootPath: join(process.cwd(), 'uploads'), // 使用项目根目录
      serveRoot: '/uploads',
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en', // 默认语言
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'), // 语言文件路径
        watch: true, // 监听语言文件变化
      },
      resolvers: [
        // { use: QueryResolver, options: ['lang'] }, // lang=zh-CN
        // AcceptLanguageResolver, // Accept-Language=zh-CN
        // new HeaderResolver(['x-lang']), // x-lang=zh-CN
        new QueryResolver(["lang", "l"]),
        AcceptLanguageResolver,
      ],
    }),
    ApiModule,
    SharedModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
