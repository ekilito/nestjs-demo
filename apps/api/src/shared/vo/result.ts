import { ApiProperty } from '@nestjs/swagger';

export class Result<T = any> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '操作成功' })
  message: string;

  @ApiProperty({ description: '返回数据' })
  data?: T;

  constructor(code: number, success: boolean, message: string, data?: T) {
    this.code = code;
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static ok<T>(data?: T, message = '操作成功') {
    return new Result(200, true, message, data);
  }

  static fail(message = '操作失败', code = 500) {
    return new Result(code, false, message);
  }
}