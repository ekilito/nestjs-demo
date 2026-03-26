import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationService } from './services/configuration.service';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { IsUsernameUniqueConstraint } from './validators/user-validators'; // 引入自定义验证器
import { UtilityService } from './services/utility.service'; // 引入工具服务
import { Role } from './entities/role.entity';
import { RoleService } from './services/role.service';
import { Access } from './entities/access.entity';
import { AccessService } from './services/access.service';
import { Tag } from './entities/tag.entity';
import { TagService } from './services/tag.service';
import { Category } from './entities/category.entity';
import { CategoryService } from './services/category.service';
import { Article } from './entities/article.entity';
import { Setting } from './entities/setting.entity';
import { ArticleService } from './services/article.service';
import { CosService } from './services/cos.service';
import { NotificationService } from './services/notification.service';
import { MailService } from './services/mail.service';
import { WordExportService } from './services/word-export.service';
import { PptExportService } from './services/ppt-export.service'; // 引入 PPT 导出服务
import { ExcelExportService } from './services/excel-export.service'; // 引入 Excel 导出服务
import { SettingService } from './services/setting.service';
import { DashboardService } from './services/dashboard.service'; // 引入 Dashboard 服务


@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      // 加载环境变量配置
      isGlobal: true,
      envFilePath: ['.env', 'apps/api/.env'],
    }),
    // 配置TypeORM连接MySQL数据库
    TypeOrmModule.forRootAsync({
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => ({
        type: 'mysql', // 数据库类型
        ...configurationService.mysqlConfig, // 从ConfigurationService获取MySQL连接配置
        autoLoadEntities: true, // 自动加载所有实体类
        synchronize: true, // 自动同步数据库 schema（生产环境不建议使用）
        logging: false, // 关闭SQL日志输出（生产环境建议开启）
      }),
    }),
    TypeOrmModule.forFeature([User, Role, Access, Tag, Category, Article, Setting]), // 注册实体类，使其在当前模块可用
  ],
  providers: [
    ConfigurationService,
    UserService,
    IsUsernameUniqueConstraint,
    UtilityService,
    RoleService,
    AccessService,
    TagService,
    CategoryService,
    ArticleService,
    CosService,
    NotificationService,
    MailService,
    WordExportService,
    PptExportService, // 注册 PPT 导出服务
    ExcelExportService, // 注册 Excel 导出服务
    SettingService,
    DashboardService, // 注册 Dashboard 服务
  ], // 注册服务类，使其可以被注入使用
  exports: [
    ConfigurationService,
    UserService,
    IsUsernameUniqueConstraint,
    UtilityService,
    RoleService,
    AccessService,
    TagService,
    CategoryService,
    ArticleService,
    CosService,
    NotificationService,
    MailService,
    WordExportService,
    PptExportService, // 导出 PPT 导出服务，使其在其他模块可用
    ExcelExportService, // 导出 Excel 导出服务，使其在其他模块可用
    SettingService,
    DashboardService, // 导出 Dashboard 服务，使其在其他模块可用
  ], // 导出服务类，使其在其他模块可用
})
export class SharedModule { }
