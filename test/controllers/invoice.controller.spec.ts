/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthUser } from 'src/application/common/auth-user.interface';
import { AlreadyExistException } from 'src/application/exceptions/already-exist.exception';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';
import { GenerateInvoicePdfUseCase } from 'src/application/use-cases/generate-invoice-pdf.use-case';
import { IssueInvoiceUseCase } from 'src/application/use-cases/issue-invoice.use-case';
import { InvoiceController } from 'src/infra/http/controllers/invoice.controller';
import { SubscriptionModule } from 'src/infra/modules/subscription.module';
import { FastifyReply } from 'fastify';

const generateInvoicePdfUseCaseMock = {
  provide: GenerateInvoicePdfUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const issueInvoiceUseCaseMock = {
  provide: IssueInvoiceUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const reply = {
  header: jest.fn().mockReturnThis(),
  send: jest.fn(),
} as unknown as FastifyReply;

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let spies: any;

  const timezone = 'America/Sao_Paulo';

  const user: AuthUser = {
    id: '1234567532',
    email: 'Lumminus@email.com',
    role: 'COMPANY',
  };

  const serviceExecutionId = '1234221334';
  const invoiceId = '1232134532';

  const fakePdf = Buffer.from('pdf');

  beforeAll(async () => {
    jest.clearAllMocks();

    const moduleTest: TestingModule = await Test.createTestingModule({
      imports: [SubscriptionModule],
      controllers: [InvoiceController],
      providers: [generateInvoicePdfUseCaseMock, issueInvoiceUseCaseMock],
    }).compile();

    controller = moduleTest.get(InvoiceController);

    const generateInvoicePdfUseCase = moduleTest.get(GenerateInvoicePdfUseCase);
    const issueInvoiceUseCase = moduleTest.get(IssueInvoiceUseCase);

    spies = {
      generateInvoicePdfUseCase: {
        handle: jest.spyOn(generateInvoicePdfUseCase, 'handle'),
      },
      issueInvoiceUseCase: {
        handle: jest.spyOn(issueInvoiceUseCase, 'handle'),
      },
      reply: {
        header: jest.spyOn(reply, 'header'),
        send: jest.spyOn(reply, 'send'),
      },
    };
  });

  // ==================== Issued method ====================

  it('should issue a invoice', async () => {
    spies.issueInvoiceUseCase.handle.mockResolvedValue({ invoiceId });

    const response = await controller.issueInvoice(
      serviceExecutionId,
      user,
      timezone,
    );

    expect(spies.issueInvoiceUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
      serviceExecutionId,
      timezone,
    });

    expect(response.message).toBe('Invoice successfully created');
    expect(response.invoiceId).toBe(invoiceId);
  });

  it('should return EntityNotFoundException when some entity not found', async () => {
    spies.issueInvoiceUseCase.handle.mockRejectedValue(
      new EntityNotFoundException('', '', ''),
    );

    await expect(
      controller.issueInvoice(serviceExecutionId, user, timezone),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should return NonBelongingException when something belong not the company', async () => {
    spies.issueInvoiceUseCase.handle.mockRejectedValue(
      new NonBelongingException('', '', ''),
    );

    await expect(
      controller.issueInvoice(serviceExecutionId, user, timezone),
    ).rejects.toThrow(NonBelongingException);
  });

  it('should return AlreadyExistException when already exist a invoice of the ServiceExecution', async () => {
    spies.issueInvoiceUseCase.handle.mockRejectedValue(
      new AlreadyExistException('', '', ''),
    );

    await expect(
      controller.issueInvoice(serviceExecutionId, user, timezone),
    ).rejects.toThrow(AlreadyExistException);
  });

  // ==================== Generate method ====================
  it('should return a invoice pdf', async () => {
    spies.generateInvoicePdfUseCase.handle.mockResolvedValue(fakePdf);

    await controller.generatePdf(invoiceId, user, reply);

    expect(spies.generateInvoicePdfUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
      invoiceId,
    });

    expect(spies.reply.header).toHaveBeenCalledWith(
      'Content-Type',
      'application/pdf',
    );
    expect(spies.reply.header).toHaveBeenCalledWith(
      'Content-Disposition',
      'inline; filename="nota-servico.pdf"',
    );
    expect(spies.reply.send).toHaveBeenCalledWith(fakePdf);
  });

  it('should throw a EntityNotFoundException when some entity not found', async () => {
    spies.generateInvoicePdfUseCase.handle.mockRejectedValue(
      new EntityNotFoundException('', '', ''),
    );

    await expect(
      controller.generatePdf(invoiceId, user, reply),
    ).rejects.toThrow(EntityNotFoundException);

    expect(spies.generateInvoicePdfUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
      invoiceId,
    });
  });

  it('should throw a NonBelongingException when the invoice does not belong to the company', async () => {
    spies.generateInvoicePdfUseCase.handle.mockRejectedValue(
      new NonBelongingException('', '', ''),
    );

    await expect(
      controller.generatePdf(invoiceId, user, reply),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.generateInvoicePdfUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
      invoiceId,
    });
  });
});
