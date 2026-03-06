import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session'; // 引入session模块 用于存储用户会话信息
import * as cookieParser from 'cookie-parser'; // 引入cookie-parser模块 用于解析cookie

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 解析cookie 并将其挂载到req.cookies上
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