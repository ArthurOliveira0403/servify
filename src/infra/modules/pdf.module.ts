import { Module } from '@nestjs/common';
import { PupperteertPdfService } from '../services/pdf/pupperteer/pupperteer-pdf.service';
import { PDF_SERVICE } from 'src/application/services/pdf.service';
import { HandlebarsTemplateCompilerService } from '../services/pdf/handlebars/handlebars-template-compiler.service';
import { INVOICE_PDF_STORAGE_SERVICE } from 'src/application/services/invoice-pdf-storage.service';
import { LocalInvoicePdfStorageService } from '../services/local-storage/local-invoice-pdf-storage.service';

@Module({
  providers: [
    HandlebarsTemplateCompilerService,
    { provide: PDF_SERVICE, useClass: PupperteertPdfService },
    {
      provide: INVOICE_PDF_STORAGE_SERVICE,
      useClass: LocalInvoicePdfStorageService,
    },
  ],
  exports: [PDF_SERVICE, INVOICE_PDF_STORAGE_SERVICE],
})
export class PdfModule {}
