import { Module } from '@nestjs/common';
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


@Module({
  controllers: [UserController, RoleController, AccessController, TagController, CategoryController, ArticleController, UploadController, SettingController, DashboardController, AuthController],
  providers: [WordExportService], // 注册 Word 导出服务
})
export class ApiModule { }
