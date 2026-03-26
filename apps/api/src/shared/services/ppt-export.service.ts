import { Injectable } from '@nestjs/common';
import PptxGenJS from 'pptxgenjs'; // 导入 pptxgenjs 库，用于生成 PPTX 文件
import * as html2ppt from 'html-pptxgenjs'; // 导入 html-pptxgenjs 库，用于将 HTML 转换为 PPTX 内容

@Injectable()
export class PptExportService {
  async exportToPpt(htmlSlides: string[]): Promise<Buffer> {
    const pptx = new PptxGenJS();
    // 遍历每一页 HTML 内容，转换为 PPT 幻灯片
    for (const htmlContent of htmlSlides) {
      // 添加一个新的幻灯片到 PPTX
      const slide = pptx.addSlide();
      // 使用 html-pptxgenjs 将 HTML 内容转换为 PPTX 可用的文本项
      const items = html2ppt.htmlToPptxText(htmlContent);
      // 将生成的文本项添加到幻灯片中，设置其位置和大小
      slide.addText(items, { x: 0.5, y: 0.5, w: 9.5, h: 6, valign: 'top' });
    }
    // 将生成的 PPTX 文件以 nodebuffer 的形式输出
    const fileBuffer = await pptx.write({ outputType: 'nodebuffer' });
    return Buffer.isBuffer(fileBuffer)
      ? fileBuffer
      : Buffer.from(fileBuffer as ArrayBuffer);
  }
}
