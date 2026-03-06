import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session'; // 引入session模块 用于存储用户会话信息
import * as cookieParser from 'cookie-parser'; // 引入cookie-parser模块 用于解析cookie
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path'; // 引入join函数 用于拼接路径

async function bootstrap() {
  // 创建 NestExpressApplication 实例
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ 1. 配置静态资源目录（用于前端打包后的文件）
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static',  // 访问前缀：/static/xxx
  });

  // ✅ 2. 配置 CORS（允许前端访问）
  app.enableCors({
    origin: 'http://localhost:5173',  // React 开发服务器地址
    credentials: true,                 // 允许携带 cookie
  });

  // ✅ 3. 设置全局路由前缀（可选）
  app.setGlobalPrefix('api');

  // ✅ 4. 解析cookie 并将其挂载到req.cookies上
  app.use(cookieParser());
  // 配置session中间件
  app.use(session({
    secret: 'secret-key', // 用于加密session数据的密钥
    resave: true, // 每次请求都重新保存session 即使未修改
    saveUninitialized: true, // 无论是否有修改 都保存session
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 会话过期时间 7天
    },
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
