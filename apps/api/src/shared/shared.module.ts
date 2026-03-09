import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationService } from './services/configuration.service';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { IsUsernameUniqueConstraint } from './validators/user-validators'; // 引入自定义验证器
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ // 加载环境变量配置
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
    TypeOrmModule.forFeature([User]), // 注册User实体类，使其在当前模块可用
  ],
  providers: [ConfigurationService, UserService, IsUsernameUniqueConstraint],
  exports: [ConfigurationService, UserService, IsUsernameUniqueConstraint],
})
export class SharedModule { }
