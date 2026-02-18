import { Invoice as PrismaInvoice } from '@prisma/client';
import { Invoice as DomainInvoice } from 'src/domain/entities/invoice';

export class PrismaInvoiceMapper {
  static toPrisma(invoice: DomainInvoice) {
    return {
      id: invoice.id,
      company_id: invoice.companyId,
      company_name: invoice.companyName,
      company_cnpj: invoice.companyCnpj,
      company_phone: invoice.companyPhone,
      client_name: invoice.clientName,
      client_international_id: invoice.clientInternationalId,
      client_phone: invoice.clientPhone,
      service_execution_id: invoice.serviceExecutionId,
      service_name: invoice.serviceName,
      service_description: invoice.serviceDescription,
      executed_at: invoice.executedAt,
      price: invoice.price,
      issued_at: invoice.issuedAt,
      status: invoice.status,
      invoice_number: invoice.invoiceNumber,
      pdf_path: invoice.pdfPath,
      timezone: invoice.timezone,
      created_at: invoice.createdAt,
      updated_at: invoice.updatedAt,
    };
  }

  static toDomain(invoice: PrismaInvoice) {
    return new DomainInvoice({
      id: invoice.id,
      companyId: invoice.company_id,
      companyName: invoice.company_name,
      companyCnpj: invoice.company_cnpj,
      companyPhone: invoice.company_phone ?? undefined,
      clientName: invoice.client_name,
      clientInternationalId: invoice.client_international_id,
      clientPhone: invoice.client_phone ?? undefined,
      serviceExecutionId: invoice.service_execution_id,
      serviceName: invoice.service_name,
      serviceDescription: invoice.service_description,
      executedAt: invoice.executed_at,
      price: invoice.price,
      issuedAt: invoice.issued_at,
      status: invoice.status,
      invoiceNumber: invoice.invoice_number,
      pdfPath: invoice.pdf_path ?? undefined,
      timezone: invoice.timezone,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
    });
  }
}
