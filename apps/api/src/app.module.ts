import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { SharedModule } from './shared/shared.module';
import { AdminModule } from './admin/admin.module';
import { LoggerModule } from './logger/logger.module';
import { I18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'zh', // 默认语言
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'), // 语言文件路径
        watch: true, // 监听语言文件变化
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // lang=zh-CN
        AcceptLanguageResolver,// Accept-Language=zh-CN
        new HeaderResolver(['x-lang']), // x-lang=zh-CN
      ],
    }),
    ApiModule,
    SharedModule,
    AdminModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
