import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

type ExcelColumn = {
  header: string;
  key: string;
  width: number;
};

@Injectable()
export class ExcelExportService {
  async exportAsExcel(
    data: Record<string, unknown>[],
    columns: ExcelColumn[],
    sheetName = 'Data',
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = columns;

    data.forEach((item) => {
      worksheet.addRow(item);
    });

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.eachRow((row) => {
      row.alignment = { vertical: 'top', wrapText: true };
    });

    const fileBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(fileBuffer)
      ? fileBuffer
      : Buffer.from(fileBuffer as ArrayBuffer);
  }
}
