import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session'; // 引入session模块 用于存储用户会话信息
import cookieParser from 'cookie-parser'; // 引入cookie-parser模块 用于解析cookie
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path'; // 引入join函数 用于拼接路径
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { MyLogger } from './logger';
import { ExtendedConsoleLogger } from './extended-console-logger';
import { AdminExceptionFilter } from './api/filters/exception.filter';
import { I18nValidationPipe, I18nService } from 'nestjs-i18n';

async function bootstrap() {
  // 创建 NestExpressApplication 实例
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // logger: false, // 关闭默认的日志记录器
    // logger: ['error', 'warn', 'log'], // 只保留错误、警告和日志记录
    // logger: console, // 打印所有日志到控制台 自定义的实现
    // logger: new ExtendedConsoleLogger(), // 打印所有日志到控制台 自定义的实现
    // bufferLogs: true, // 启用缓冲区日志记录
  });
  // app.useLogger(app.get(MyLogger));

  // ✅ 1. 配置静态资源目录（用于前端打包后的文件）
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static', // 访问前缀：/static/xxx
  });

  // ✅ 2. 配置 CORS（允许前端访问）
  app.enableCors({
    origin: 'http://localhost:5173', // React 开发服务器地址
    credentials: true, // 允许携带 cookie
  });

  // ✅ 3. 设置全局路由前缀（可选）
  app.setGlobalPrefix('api');

  // ✅ 配置全局异常过滤器（处理所有异常）
  app.useGlobalFilters(new AdminExceptionFilter(app.get(I18nService)));

  // i18n 全局验证管道
  app.useGlobalPipes(new I18nValidationPipe({ transform: true }));

  // ✅ 4. 解析cookie 并将其挂载到req.cookies上
  app.use(cookieParser());
  // 配置session中间件
  app.use(
    session({
      secret: 'secret-key', // 用于加密session数据的密钥
      resave: true, // 每次请求都重新保存session 即使未修改
      saveUninitialized: true, // 无论是否有修改 都保存session
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 会话过期时间 7天
        httpOnly: true, // ✅ 建议加上，增强安全性
        sameSite: 'lax', // ✅ 建议加上，CSRF保护
      },
    }),
  );
  // ✅ 5. 配置全局验证管道（自动验证 DTO 数据）
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 开启自动转换（将请求数据转换为 DTO 实例）
    }),
  );

  // ✅ 6. 配置 Swagger 文档（API 文档）
  const config = new DocumentBuilder()
    .setTitle('CMS API') // 设置 API 的标题
    .setDescription('The CMS API description') // 设置 API 的描述
    .setVersion('1.0') // 设置 API 的版本
    .addTag('CMS') // 添加一个标签，用于对 API 进行分类
    .addCookieAuth('connect.sid') // 添加 Cookie 认证方式，名称为 'connect.sid'
    .addBearerAuth({ type: 'http', scheme: 'bearer' }) // 添加 Bearer 认证方式，类型为 'http'，认证方案为 'bearer'
    .build(); // 构建并生成最终的配置对象
  // 使用配置对象创建 Swagger 文档
  const document = SwaggerModule.createDocument(app, config);
  // 设置 Swagger 模块的路径和文档对象，将 Swagger UI 绑定到 '/api-doc' 路径上
  // SwaggerModule.setup('api-doc', app, document);
  app.use(
    '/api-doc',
    apiReference({
      spec: {
        content: document,
      },
    } as any),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
