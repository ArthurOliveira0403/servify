import { Injectable } from '@nestjs/common';
import { InvoiceRepository } from 'src/domain/repositories/invoice.repository';
import { PrismaService } from '../prisma.service';
import { Invoice } from 'src/domain/entities/invoice';
import { PrismaInvoiceMapper } from '../mappers/prisma-invoice.mapper';

@Injectable()
export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(invoice: Invoice): Promise<void> {
    const raw = PrismaInvoiceMapper.toPrisma(invoice);

    await this.prisma.invoice.create({ data: raw });
  }

  async findById(id: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return null;

    return PrismaInvoiceMapper.toDomain(invoice);
  }

  async findIssuedByServiceExecution(
    serviceExecutionId: string,
  ): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        service_execution_id: serviceExecutionId,
        AND: { status: 'VALID', service_execution_id: serviceExecutionId },
      },
    });

    if (!invoice) return null;

    return PrismaInvoiceMapper.toDomain(invoice);
  }

  async update(invoice: Invoice): Promise<void> {
    const raw = PrismaInvoiceMapper.toPrisma(invoice);

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: raw,
    });
  }
}
