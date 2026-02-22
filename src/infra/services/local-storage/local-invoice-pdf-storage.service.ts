import { Injectable } from '@nestjs/common';
import { InvoicePdfStorageService } from 'src/application/services/invoice-pdf-storage.service';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { InvoicePdfStorageException } from 'src/infra/exceptions/invoice-pdf-storage-service.exception';

@Injectable()
export class LocalInvoicePdfStorageService implements InvoicePdfStorageService {
  private readonly baseDir = path.resolve(__dirname, 'uploads');

  async save(
    InvoiceId: string,
    invoiceNumber: string,
    file: Buffer,
  ): Promise<string> {
    const now = new Date();

    const dir = path.join(
      this.baseDir,
      now.getFullYear().toString(),
      String(now.getMonth() + 1).padStart(2, '0'),
    );

    await fs.mkdir(dir, { recursive: true });

    const fileName = `${invoiceNumber}_${InvoiceId}.pdf`;
    const filePath = path.join(dir, fileName);

    await fs.writeFile(filePath, file);

    return path.relative(process.cwd(), filePath);
  }

  async get(filePath: string): Promise<Buffer> {
    try {
      const absolutePath = path.resolve(process.cwd(), filePath);
      return fs.readFile(absolutePath);
    } catch (error) {
      throw new InvoicePdfStorageException(
        `Error in make absolute path of get method: ${error}`,
        LocalInvoicePdfStorageService.name,
      );
    }
  }
}
