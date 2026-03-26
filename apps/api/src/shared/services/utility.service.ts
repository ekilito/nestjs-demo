import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'; // 导入 bcrypt 库，用于处理密码哈希和验证
import * as svgCaptcha from 'svg-captcha'; // 导入 svg-captcha 库，用于生成验证码图片

@Injectable()
export class UtilityService {
  /**
   * @param password 
   * @returns 
   * 定义一个异步方法，用于对输入的密码进行哈希处理，并返回哈希结果
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(); // 生成一个盐值，用于增强哈希的安全性
    return bcrypt.hash(password, salt); // 使用生成的盐值对密码进行哈希，并返回哈希结果
  }
  // 比较输入的密码和存储的哈希值是否匹配
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);// 使用 bcrypt 的 compare 方法比较密码和哈希值，返回比较结果（true 或 false）
  }

  /** 
  * 生成验证码
  */
  generateCaptcha(options) {
    return svgCaptcha.create(options);
  }
}
