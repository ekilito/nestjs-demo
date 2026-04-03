import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { AccessController } from './controllers/access.controller';
import { TagController } from './controllers/tag.controller';
import { CategoryController } from './controllers/category.controller';
import { ArticleController } from './controllers/article.controller';
import { UploadController } from './controllers/upload.controller';
import { SettingController } from './controllers/setting.controller';
import { WordExportService } from '../shared/services/word-export.service';
import { DashboardController } from './controllers/dashboard.controller';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';


@Module({
  imports: [
    // 全局注册 JwtModule，并设置过期时间为 7 天
    JwtModule.register({
      global: true, // 设置为全局模块
      signOptions: { expiresIn: '7d' } // 设置 JWT 过期时间为 7 天
    }),
  ],
  controllers: [UserController, RoleController, AccessController, TagController, CategoryController, ArticleController, UploadController, SettingController, DashboardController, AuthController],
  providers: [
    WordExportService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ], // 注册 Word 导出服务
})
export class ApiModule { }
