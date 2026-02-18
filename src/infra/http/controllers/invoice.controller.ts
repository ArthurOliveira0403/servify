import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GenerateInvoicePdfUseCase } from 'src/application/use-cases/generate-invoice-pdf.use-case';
import { IssueInvoiceUseCase } from 'src/application/use-cases/issue-invoice.use-case';
import {
  type GenerateInvoicePdfParamDTO,
  generateInvoicePdfParamSchema,
} from 'src/infra/schemas/generate-invoice-pdf.schemas';
import {
  type IssueInvoiceParamDTO,
  issueInvoiceParamSchema,
} from 'src/infra/schemas/issue-invoice.schemas';
import type { FastifyReply } from 'fastify';
import { Timezone } from 'src/infra/decorators/timezone.decorator';
import { SubscriptionGuard } from 'src/infra/guards/subscription.guard';
import { AuthUser } from 'src/domain/common/auth-user.interface';
import { Zod } from 'src/infra/decorators/zod.decorator';
import { CurrentUser } from 'src/infra/decorators/current-user.decorator';
import { Roles } from 'src/infra/decorators/roles.decorator';

@Roles('COMPANY')
@Controller('invoice')
export class InvoiceController {
  constructor(
    private issueInvoiceUseCase: IssueInvoiceUseCase,
    private generateInvoicePdfUseCase: GenerateInvoicePdfUseCase,
  ) {}

  @Post(':id/issue')
  @UseGuards(SubscriptionGuard)
  async issueInvoice(
    @Param('id', Zod(issueInvoiceParamSchema))
    id: IssueInvoiceParamDTO,
    @CurrentUser() user: AuthUser,
    @Timezone() timezone: string,
  ) {
    if (!timezone) throw new BadRequestException('Timezone not informed');

    const { invoiceId } = await this.issueInvoiceUseCase.handle({
      companyId: user.id,
      serviceExecutionId: id,
      timezone,
    });

    return {
      message: 'Invoice successfully created',
      invoiceId,
    };
  }

  @Get(':id/pdf')
  async generatePdf(
    @Param('id', Zod(generateInvoicePdfParamSchema))
    id: GenerateInvoicePdfParamDTO,
    @CurrentUser() user: AuthUser,
    @Res() res: FastifyReply,
  ) {
    const pdf = await this.generateInvoicePdfUseCase.handle({
      companyId: user.id,
      invoiceId: id,
    });

    res
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', 'inline; filename="nota-servico.pdf"')
      .send(pdf);
  }
}
