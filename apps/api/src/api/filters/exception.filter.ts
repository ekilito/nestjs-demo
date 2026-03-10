import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// 使用 @Catch 装饰器捕获所有 HttpException 异常
@Catch(HttpException)
export class AdminExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // 实现 catch 方法，用于处理捕获的异常
    const ctx = host.switchToHttp(); // 获取当前 HTTP 请求上下文
    const response = ctx.getResponse<Response>(); // 获取 HTTP 响应对象
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus(); // 获取异常的 HTTP 状态码
    // 初始化错误信息，默认为异常的消息
    let errorMessage = exception.message;
    if (exception instanceof BadRequestException) {
      // 获取异常的响应体
      const responseBody: any = exception.getResponse();
      // 检查响应体是否是对象并且包含 message 属性
      if (typeof responseBody === 'object' && responseBody.message) {
        // 如果 message 是数组，则将其拼接成字符串，否则直接使用 message
        errorMessage = Array.isArray(responseBody.message)
          ? responseBody.message.join(', ')
          : responseBody.message;
      }
    }
    return response.status(status).json({
      code: status,
      success: false,
      message: errorMessage,
      path: request.originalUrl ?? request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
