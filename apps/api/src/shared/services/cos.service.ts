import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import COS from 'cos-nodejs-sdk-v5';

@Injectable()
export class CosService implements OnModuleInit {
  private cos: COS;
  private readonly logger = new Logger(CosService.name);

  constructor(private readonly configService: ConfigService) {
    // 初始化 COS 实例，使用配置服务中的 SecretId 和 SecretKey
    this.cos = new COS({
      SecretId: this.configService.get('COS_SECRET_ID'),
      SecretKey: this.configService.get('COS_SECRET_KEY'),
    });
  }

  // 模块初始化时验证配置
  onModuleInit() {
    this.validateConfig();
  }

  // 验证配置
  private validateConfig() {
    const requiredConfigs = ['COS_SECRET_ID', 'COS_SECRET_KEY', 'COS_BUCKET', 'COS_REGION'];
    const missingConfigs = requiredConfigs.filter(
      config => !this.configService.get(config)
    );

    if (missingConfigs.length) {
      const error = `Missing COS configurations: ${missingConfigs.join(', ')}`;
      this.logger.error(error);
      throw new Error(error);
    }
  }

  // 获取签名认证信息
  getAuth(
    key: string, // 文件对象键（路径）
    expirationTime: number = 60, // 签名有效期，默认 60 秒
    method: 'get' | 'post' | 'put' | 'delete' = 'post'
  ): {
    sign: string; // 签名
    key: string; // 文件对象键（路径）
    bucket: string; // 存储桶名称
    region: string; // 存储桶所在区域
    method: string; // 请求方法
  } {
    try {
      const bucket = this.configService.get('COS_BUCKET');
      const region = this.configService.get('COS_REGION');

      const sign = this.cos.getAuth({
        Method: method,
        Key: key, // 文件对象键（路径）
        Expires: expirationTime, // 签名有效期
        Bucket: bucket, // 存储桶名称
        Region: region, // 存储桶所在区域
        Headers: {
          'Content-Disposition': 'inline'
        }
      });

      return {
        sign,
        key,
        bucket,
        region,
        method,
      };
    } catch (error) {
      this.logger.error(`Failed to generate COS auth: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate COS authentication');
    }
  }

  async uploadFile(key: string, body: Buffer, contentType = 'image/jpeg') {
    const bucket = this.configService.get('COS_BUCKET');
    const region = this.configService.get('COS_REGION');

    try {
      const result = await this.cos.putObject({
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: body,
        ContentType: contentType,
        ContentDisposition: 'inline',
      });

      return result;
    } catch (error) {
      this.logger.error(`COS upload failed: ${error.message}`);
      throw new InternalServerErrorException('文件上传到 COS 失败');
    }
  }
}