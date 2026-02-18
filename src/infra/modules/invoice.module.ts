import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { INVOICE_REPOSITORY } from 'src/domain/repositories/invoice.repository';
import { PrismaInvoiceRepository } from '../services/prisma/repositories/prisma-invoice.repository';
import { IssueInvoiceUseCase } from 'src/application/use-cases/issue-invoice.use-case';
import { InvoiceController } from '../http/controllers/invoice.controller';
import { PdfModule } from './pdf.module';
import { ClientModule } from './client.module';
import { CompanyModule } from './company.module';
import { ClientCompanyModule } from './client-company.module';
import { ServiceModule } from './service.module';
import { ServiceExecutionModule } from './service-execution.module';
import { GenerateInvoicePdfUseCase } from 'src/application/use-cases/generate-invoice-pdf.use-case';
import { DateTrasnformModule } from './date-transform.module';
import { SubscriptionModule } from './subscription.module';

@Module({
  imports: [
    DateTrasnformModule,
    DatabaseModule,
    CompanyModule,
    ClientModule,
    ClientCompanyModule,
    ServiceModule,
    ServiceExecutionModule,
    PdfModule,
    SubscriptionModule,
  ],
  providers: [
    IssueInvoiceUseCase,
    GenerateInvoicePdfUseCase,
    {
      provide: INVOICE_REPOSITORY,
      useClass: PrismaInvoiceRepository,
    },
  ],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
