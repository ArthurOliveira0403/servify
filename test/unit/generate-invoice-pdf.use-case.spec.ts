/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PriceConverter } from 'src/application/common/price-converter.common';
import { GenerateInvoicePdfDTO } from 'src/application/dtos/generate-invoice-pdf.use-case';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';
import { GenerateInvoicePdfUseCase } from 'src/application/use-cases/generate-invoice-pdf.use-case';
import { Invoice } from 'src/domain/entities/invoice';
import { InMemoryInvoiceRepository } from 'test/utils/in-memory/in-memory.invoice-repository';
import { dateTransformServiceMock } from 'test/utils/mocks/date-transform-service.mock';
import { invoicePdfStorageServiceMock } from 'test/utils/mocks/invoice-pdf-storage-service.mock';
import { pdfServiceMock } from 'test/utils/mocks/pdf-service.mock';

describe('GenerateInvoicePdfUseCase', () => {
  let useCase: GenerateInvoicePdfUseCase;
  let spies: any;

  const companyId = '1234';
  const now = new Date('2026-01-01T00:00:00Z');

  const invoice = new Invoice({
    companyId,
    companyName: 'Luminnus',
    companyCnpj: '123455432',
    companyPhone: '12345665',
    clientInternationalId: '1312',
    clientName: 'John Doe',
    clientPhone: '23342123',
    serviceExecutionId: '21',
    serviceName: 'A service name',
    serviceDescription: 'A service description',
    price: 12999,
    executedAt: now,
    issuedAt: now,
    timezone: 'America/Sao_Paulo',
    invoiceNumber: '98987670',
    createdAt: now,
    updatedAt: now,
  });

  const fakePdf = Buffer.from('pdf');
  const fakePdfPath = 'path/to/invoice.pdf';

  const invoiceWithPath = new Invoice({
    companyId,
    companyName: 'Luminnus',
    companyCnpj: '123455432',
    companyPhone: '12345665',
    clientInternationalId: '1312',
    clientName: 'John Doe',
    clientPhone: '23342123',
    serviceExecutionId: '21',
    serviceName: 'A service name',
    serviceDescription: 'A service description',
    price: 12999,
    executedAt: now,
    issuedAt: now,
    timezone: 'America/Sao_Paulo',
    invoiceNumber: '98987670',
    pdfPath: fakePdfPath,
    createdAt: now,
    updatedAt: now,
  });

  const data: GenerateInvoicePdfDTO = {
    companyId,
    invoiceId: invoice.id,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const invoiceRepository = new InMemoryInvoiceRepository();
    const pdfService = pdfServiceMock;
    const invoicePdfStorageService = invoicePdfStorageServiceMock;
    const dateTransformService = dateTransformServiceMock;

    useCase = new GenerateInvoicePdfUseCase(
      invoiceRepository,
      pdfService,
      invoicePdfStorageService,
      dateTransformService,
    );

    spies = {
      invoiceRepository: {
        findById: jest.spyOn(invoiceRepository, 'findById'),
        update: jest.spyOn(invoiceRepository, 'update'),
      },
      invoicePdfStorageService: {
        get: jest.spyOn(invoicePdfStorageService, 'get'),
        save: jest.spyOn(invoicePdfStorageService, 'save'),
      },
      priceConverter: {
        toResponse: jest.spyOn(PriceConverter, 'toResponse'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC').mockReturnValue(now),
        formatInTimezoneWithoutHour: jest.spyOn(
          dateTransformService,
          'formatInTimezoneWithoutHour',
        ),
      },
      pdfService: {
        generate: jest.spyOn(pdfService, 'generate'),
      },
      invoice: {
        updatePdfPath: jest.spyOn(invoice, 'updatePdfPath'),
      },
    };

    await invoiceRepository.save(invoice);
  });

  it('should generate a new invoice pdf when not exist', async () => {
    spies.pdfService.generate.mockResolvedValue(fakePdf);
    spies.invoicePdfStorageService.save.mockResolvedValue(fakePdfPath);

    const response = await useCase.handle(data);

    expect(spies.invoiceRepository.findById).toHaveBeenCalledWith(
      data.invoiceId,
    );
    expect(spies.invoicePdfStorageService.get).not.toHaveBeenCalled();
    expect(spies.pdfService.generate).toHaveBeenCalled();
    expect(spies.invoicePdfStorageService.save).toHaveBeenCalledWith(
      invoice.id,
      invoice.invoiceNumber,
      fakePdf,
    );
    expect(spies.invoice.updatePdfPath).toHaveBeenCalledWith(fakePdfPath, now);

    expect(response).toEqual(fakePdf);
  });

  it('should return the invoice pdf when already exist', async () => {
    spies.invoicePdfStorageService.get.mockResolvedValue(fakePdf);

    const response = await useCase.handle(data);

    expect(spies.invoiceRepository.findById).toHaveBeenCalledWith(
      data.invoiceId,
    );
    expect(spies.invoicePdfStorageService.get).toHaveBeenCalledWith(
      invoiceWithPath.pdfPath,
    );
    expect(response).toEqual(fakePdf);
  });

  it('should throw a EntityNotFoundException when the invoice not exist', async () => {
    const fakeInvoiceId = '1234554323456786543567865678';

    await expect(
      useCase.handle({ ...data, invoiceId: fakeInvoiceId }),
    ).rejects.toThrow(EntityNotFoundException);

    expect(spies.invoiceRepository.findById).toHaveBeenCalledWith(
      fakeInvoiceId,
    );
  });

  it('should throw a NonBelongingException when the invoice non belong to the company', async () => {
    const fakeCompanyId = '1234554323456786543567865678';

    await expect(
      useCase.handle({ ...data, companyId: fakeCompanyId }),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.invoiceRepository.findById).toHaveBeenCalledWith(
      data.invoiceId,
    );
  });
});
