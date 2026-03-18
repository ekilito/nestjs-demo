import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nValidationException, I18nService } from 'nestjs-i18n';
import { ValidationError } from 'class-validator';
import { QueryFailedError } from 'typeorm';

// 使用 @Catch 装饰器捕获所有 HttpException 异常
@Catch()
export class AdminExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) { }
  catch(exception: unknown, host: ArgumentsHost) {
    // 实现 catch 方法，用于处理捕获的异常
    const ctx = host.switchToHttp(); // 获取当前 HTTP 请求上下文
    const response = ctx.getResponse<Response>(); // 获取 HTTP 响应对象
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    // 初始化错误信息，默认为异常的消息
    let errorMessage =
      exception instanceof HttpException
        ? exception.message
        : exception instanceof Error
          ? exception.message
          : String(exception);

    // 处理 i18n 验证异常
    if (exception instanceof I18nValidationException) {
      const errors = exception.errors ?? [];
      const messages: string[] = [];
      const flattenErrors = (validationErrors: ValidationError[]) => {
        validationErrors.forEach((err: ValidationError) => {
          if (err.constraints) {
            messages.push(...Object.values(err.constraints));
          }
          if (err.children && err.children.length > 0) {
            flattenErrors(err.children);
          }
        });
      };
      flattenErrors(errors);
      const reqWithI18n = request as Request & { i18nLang?: string };
      const lang: string | undefined = reqWithI18n.i18nLang;
      const translated = messages.map((msg) => {
        if (typeof msg !== 'string') return String(msg);
        const parts = msg.split('|', 2);
        const key = parts[0];
        if (parts.length === 2) {
          try {
            const parsed: unknown = JSON.parse(parts[1]);
            if (parsed && typeof parsed === 'object') {
              return this.i18n.t(key, {
                lang,
                args: parsed as Record<string, unknown>,
              });
            }
            return this.i18n.t(key, { lang });
          } catch {
            return this.i18n.t(key, { lang });
          }
        }
        return msg;
      });
      errorMessage = translated.join(', ');
    } else if (exception instanceof BadRequestException) {
      // 获取异常的响应体
      const responseBody: unknown = exception.getResponse();
      // 检查响应体是否是对象并且包含 message 属性
      if (
        responseBody &&
        typeof responseBody === 'object' &&
        'message' in responseBody
      ) {
        const msg = (responseBody as { message?: unknown }).message;
        // 如果 message 是数组，则将其拼接成字符串，否则直接使用 message
        if (Array.isArray(msg)) {
          errorMessage = msg.map((v) => String(v)).join(', ');
        } else if (typeof msg === 'string') {
          errorMessage = msg;
        } else if (msg != null) {
          errorMessage = String(msg);
        }
      }
    } else if (exception instanceof QueryFailedError) { // 处理数据库查询失败异常
      const mysqlErr = exception as unknown as {
        code?: string;
        errno?: number;
        message?: string;
        sqlMessage?: string;
      };
      // MySQL 外键约束相关
      // 1451 ER_ROW_IS_REFERENCED_2: 不能删除/更新父记录（被引用）
      // 1452 ER_NO_REFERENCED_ROW_2: 外键引用不存在
      if (mysqlErr.code === 'ER_ROW_IS_REFERENCED_2' || mysqlErr.errno === 1451) {
        errorMessage = '存在子资源，无法删除或更新父资源，请先处理其子节点';
      } else if (mysqlErr.code === 'ER_NO_REFERENCED_ROW_2' || mysqlErr.errno === 1452) {
        errorMessage = '父资源不存在，请检查 parentId';
      } else if (mysqlErr.code === 'ER_DUP_ENTRY' || mysqlErr.errno === 1062) {
        errorMessage = '唯一约束冲突，字段值已存在';
      } else {
        // 兜底，保留原始数据库错误信息（便于排查）
        errorMessage = mysqlErr.sqlMessage || mysqlErr.message || errorMessage;
      }
    }
    return response.status(status).json({
      code: status,
      success: false,
      message: errorMessage,
      // path: request.originalUrl ?? request.url,
      // timestamp: new Date().toISOString(),
    });
  }
}
