/* eslint-disable @typescript-eslint/await-thenable */
import { Invoice } from 'src/domain/entities/invoice';
import { InvoiceRepository } from 'src/domain/repositories/invoice.repository';

export class InMemoryInvoiceRepository implements InvoiceRepository {
  public invoices: Invoice[] = [];

  async save(invoice: Invoice): Promise<void> {
    await this.invoices.push(invoice);
  }

  async findById(id: string): Promise<Invoice | null> {
    const invoice = await this.invoices.find((i) => i.id === id);

    return invoice ?? null;
  }

  async findIssuedByServiceExecution(
    serviceExecutionId: string,
  ): Promise<Invoice | null> {
    const invoice = await this.invoices.find(
      (i) => i.serviceExecutionId === serviceExecutionId,
    );

    return invoice ?? null;
  }

  async update(invoice: Invoice): Promise<void> {
    const index = await this.invoices.findIndex((i) => i.id === invoice.id);
    if (index === -1) throw new Error('Invoice not found');

    this.invoices[index] = invoice;
  }
}
