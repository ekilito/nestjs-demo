// 统一响应格式 - 所有 API 返回结构一致的数据
import { ApiProperty } from '@nestjs/swagger';

export class Result {
  @ApiProperty({ description: '操作是否成功', example: true })
  public success: boolean;

  @ApiProperty({ description: '操作的消息或错误信息', example: '操作成功' })
  public message: string;

  constructor(success: boolean, message?: string) {
    this.success = success;
    this.message = message ?? '';
  }

  static success(message: string) {
    return new Result(true, message);
  }
  static fail(message: string) {
    return new Result(false, message);
  }
}
