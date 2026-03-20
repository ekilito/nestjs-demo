import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, Options } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { CosService } from '../../shared/services/cos.service';

// 文件上传配置
const FILE_UPLOAD_CONFIG: Options = {
  storage: diskStorage({ // 文件存储配置
    destination: './uploads', // 文件保存目录
    filename: (_req, file, callback) => {
      // 生成唯一文件名
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      callback(null, uniqueFilename);
    },
  }),
  // 文件过滤器
  fileFilter: (_req, file, callback) => {
    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(null, false);
    }
    callback(null, true);
  },
  // 文件大小限制
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制文件大小为 5MB
  },
};

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  constructor(private readonly cosService: CosService) { }

  @Post('uploadFile')
  @ApiOperation({ summary: '上传图片文件（压缩并转换为 JPEG）' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: '上传成功',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: '/uploads/xxx.jpeg' },
        originalName: { type: 'string', example: 'photo.png' },
        size: { type: 'number', example: 102400 },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '文件类型不支持或文件过大' })
  @UseInterceptors(FileInterceptor('upload', FILE_UPLOAD_CONFIG)) // 文件上传拦截器
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      // 验证文件是否存在
      if (!file) {
        throw new BadRequestException('未选择要上传的文件');
      }

      // 生成压缩后的文件名
      const compressedFilename = `${path.basename(file.filename, path.extname(file.filename))}.min.jpeg`;
      const compressedFilePath = `./uploads/${compressedFilename}`;

      // 图片压缩和格式转换
      await this.compressAndConvertImage(file.path, compressedFilePath);

      // 删除原始文件
      await fs.unlink(file.path);

      // 读取压缩文件信息
      const stats = await fs.stat(compressedFilePath);

      return {
        url: `/uploads/${compressedFilename}`,
        originalName: file.originalname,
        size: stats.size,
        mimetype: 'image/jpeg',
      };
    } catch (error) {
      // 清理临时文件
      if (file?.path) {
        await fs.unlink(file.path).catch(() => { });
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(`文件处理失败：${error.message}`);
    }
  }

  @Get('cos-signature')
  @ApiOperation({ summary: '获取 COS 上传签名' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取签名成功',
    schema: {
      type: 'object',
      properties: {
        sign: { type: 'string', description: 'COS 签名' },
        key: { type: 'string', description: '文件对象键（路径）' },
        bucket: { type: 'string', description: '存储桶名称' },
        region: { type: 'string', description: '存储桶所在区域' },
        method: { type: 'string', description: '请求方法' },
      },
    },
  })
  async getCosSignature(@Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('缺少文件路径参数 key');
    }

    return this.cosService.getAuth(key, 60, 'post');
  }

  /**
   * 压缩并转换图片格式
   * @param inputPath 输入文件路径
   * @param outputPath 输出文件路径
   */
  private async compressAndConvertImage(inputPath: string, outputPath: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sharp = require('sharp');

    await sharp(inputPath)
      .resize(800, 600, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  }
}