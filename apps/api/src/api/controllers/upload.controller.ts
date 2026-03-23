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
import sharp from 'sharp';
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
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
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
  @UseInterceptors(FileInterceptor('file', FILE_UPLOAD_CONFIG)) // 文件上传拦截器
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      // 验证文件是否存在
      if (!file) {
        throw new BadRequestException('未选择要上传的文件');
      }

      // 1️⃣ 生成压缩文件名
      const compressedFilename = `${path.basename(file.filename, path.extname(file.filename))}.min.jpeg`;
      const compressedFilePath = `./uploads/${compressedFilename}`;

      // 2️⃣ 压缩 + 转 jpeg
      await this.compressAndConvertImage(file.path, compressedFilePath);

      // 3️⃣ 删除原始文件（节省空间）
      await fs.unlink(file.path).catch(() => { });

      // 4️⃣ 读取压缩后的文件
      const fileBuffer = await fs.readFile(compressedFilePath);

      // 5️⃣ 生成 COS key（推荐按日期分目录）
      const date = new Date().toISOString().slice(0, 10); // 2026-03-23
      const cosKey = `uploads/${date}/${compressedFilename}`;

      // 6️⃣ 上传到 COS
      await this.cosService.uploadFile(cosKey, fileBuffer, 'image/jpeg');

      // 7️⃣ 获取 COS 访问地址
      const cosUrl = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/${cosKey}`;

      // 8️⃣ 获取文件信息
      const stats = await fs.stat(compressedFilePath);

      // ✅ 是否保留本地文件（你可以选）
      // 如果你不想占本地空间，可以删除：
      // await fs.unlink(compressedFilePath).catch(() => {});

      return {
        url: cosUrl, // ✅ 返回 COS 地址
        localUrl: `/uploads/${compressedFilename}`, // 本地地址
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
    // 使用 sharp 库处理图像，进行缩放、转换格式和压缩质量设置
    await sharp(inputPath)
      .resize(800, 600, {
        fit: sharp.fit.inside, // 使用 inside 适应方式缩放图像
        withoutEnlargement: true, // 防止图像被放大
      })
      .toFormat('jpeg') // 转换图像格式为 jpeg
      .jpeg({ quality: 80 }) // 设置图像压缩质量为 80%
      .toFile(outputPath); // 输出处理后的图像到指定路径
  }
}