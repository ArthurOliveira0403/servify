import { Inject, Injectable } from '@nestjs/common';
import { PDF_SERVICE, type PdfService } from '../services/pdf.service';
import {
  INVOICE_REPOSITORY,
  type InvoiceRepository,
} from 'src/domain/repositories/invoice.repository';
import { GenerateInvoicePdfDTO } from '../dtos/generate-invoice-pdf.use-case';
import { DEFAULT_INVOICE_PDF_TEMPLATE } from 'src/shared/constants';
import {
  INVOICE_PDF_STORAGE_SERVICE,
  type InvoicePdfStorageService,
} from '../services/invoice-pdf-storage.service';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { Invoice } from 'src/domain/entities/invoice';
import { PriceConverter } from '../common/price-converter.common';
import { NonBelongingException } from '../exceptions/non-belonging.exception';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';

@Injectable()
export class GenerateInvoicePdfUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private invoiceRepository: InvoiceRepository,
    @Inject(PDF_SERVICE)
    private pdfService: PdfService,
    @Inject(INVOICE_PDF_STORAGE_SERVICE)
    private invoicePdfStorageService: InvoicePdfStorageService,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
  ) {}

  async handle(data: GenerateInvoicePdfDTO): Promise<Buffer> {
    const invoice = await this.invoiceRepository.findById(data.invoiceId);
    if (!invoice)
      throw new EntityNotFoundException(
        `The Invoice of id: ${data.invoiceId} not found`,
        'Invoice not found',
        GenerateInvoicePdfUseCase.name,
      );

    if (invoice.companyId !== data.companyId)
      throw new NonBelongingException(
        `The Invoice of id: ${data.invoiceId} does not belong to the company of id: ${data.companyId}`,
        'The invoice does not belong to the Company',
        GenerateInvoicePdfUseCase.name,
      );

    if (invoice.pdfPath) {
      const pdfAlreadyExist = await this.invoicePdfStorageService.get(
        invoice.pdfPath,
      );

      return pdfAlreadyExist;
    }

    const pdfServiceData = {
      companyName: invoice.companyName,
      companyCnpj: invoice.companyCnpj,
      companyPhone: invoice.companyPhone ?? '',
      clientName: invoice.clientName,
      clientInternationalId: invoice.clientInternationalId,
      clientPhone: invoice.clientPhone ?? '',
      serviceExecutionId: invoice.serviceExecutionId,
      serviceName: invoice.serviceName,
      serviceDescription: invoice.serviceDescription,
      price: PriceConverter.toResponse(invoice.price),
      executedAt: this.dateTransformService.formatInTimezoneWithoutHour(
        invoice.executedAt,
        invoice.timezone,
      ),
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: this.dateTransformService.formatInTimezoneWithoutHour(
        invoice.issuedAt,
        invoice.timezone,
      ),
      timezone: invoice.timezone,
    };

    const pdf = await this.pdfService.generate(
      DEFAULT_INVOICE_PDF_TEMPLATE,
      pdfServiceData,
    );

    const pdfPath = await this.invoicePdfStorageService.save(
      invoice.id,
      invoice.invoiceNumber,
      pdf,
    );

    await this.updateInvoice(invoice, pdfPath);

    return pdf;
  }

  private async updateInvoice(
    invoice: Invoice,
    pdfPath: string,
  ): Promise<void> {
    invoice.updatePdfPath(pdfPath, this.dateTransformService.nowUTC());

    await this.invoiceRepository.update(invoice);
  }
}
