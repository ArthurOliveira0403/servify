import { Invoice } from '../entities/invoice';

export const INVOICE_REPOSITORY = 'INVOICE_REPOSITORY';

export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>;
  findById(id: string): Promise<Invoice | null>;
  findIssuedByServiceExecution(
    serviceExecutionId: string,
  ): Promise<Invoice | null>;
  update(invoice: Invoice): Promise<void>;
}
