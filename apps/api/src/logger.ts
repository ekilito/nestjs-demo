import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class MyLogger implements LoggerService {
  /**
   * 写入 'log' 级别日志。
   */
  log(message: any, ...optionalParams: any[]) {
    console.log(`[LOG] ${message}`, ...optionalParams);
  }

  /**
   * 写入 'fatal' 级别日志。
   */
  fatal(message: any, ...optionalParams: any[]) {
    console.error(`[FATAL] ${message}`, ...optionalParams);
  }

  /**
   * 写入 'error' 级别日志。
   */
  error(message: any, ...optionalParams: any[]) {
    console.error(`[ERROR] ${message}`, ...optionalParams);
  }

  /**
   * 写入 'warn' 级别日志。
   */
  warn(message: any, ...optionalParams: any[]) {
    console.warn(`[WARN] ${message}`, ...optionalParams);
  }

  /**
   * 写入 'debug' 级别日志。
   */
  debug?(message: any, ...optionalParams: any[]) {
    console.debug(`[DEBUG] ${message}`, ...optionalParams);
  }

  /**
   * 写入 'verbose' 级别日志。
   */
  verbose?(message: any, ...optionalParams: any[]) {
    console.log(`[VERBOSE] ${message}`, ...optionalParams);
  }
}
