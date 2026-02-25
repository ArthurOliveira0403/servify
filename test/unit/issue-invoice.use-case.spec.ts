/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IssueInvoiceDTO } from 'src/application/dtos/issue-invoice.dto';
import { AlreadyExistException } from 'src/application/exceptions/already-exist.exception';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';
import { IssueInvoiceUseCase } from 'src/application/use-cases/issue-invoice.use-case';
import { Client } from 'src/domain/entities/client';
import { ClientCompany } from 'src/domain/entities/client-company';
import { Company } from 'src/domain/entities/company';
import { Invoice } from 'src/domain/entities/invoice';
import { Service } from 'src/domain/entities/service';
import { ServiceExecution } from 'src/domain/entities/service-execution';
import { Feature } from 'src/domain/entities/subscription';
import { SubscriptionLimitReachedException } from 'src/domain/exceptions/subscription-limit-reached.exception';
import { InvoiceRepository } from 'src/domain/repositories/invoice.repository';
import { NonActiveSubscriptionException } from 'src/infra/exceptions/non-active-subscription.exception';
import { InMemoryClientCompanyRepository } from 'test/utils/in-memory/in-memory.client-company.repository';
import { InMemoryClientRepository } from 'test/utils/in-memory/in-memory.client-repository';
import { InMemoryCompanyRepository } from 'test/utils/in-memory/in-memory.company-repository';
import { InMemoryInvoiceRepository } from 'test/utils/in-memory/in-memory.invoice-repository';
import { InMemoryServiceExecutionRespository } from 'test/utils/in-memory/in-memory.service-execution-repository';
import { InMemoryServiceRepository } from 'test/utils/in-memory/in-memory.service-repository';
import { dateTransformServiceMock } from 'test/utils/mocks/date-transform-service.mock';
import { SubscriptionPolicyServiceMock } from 'test/utils/mocks/subscription-policy-service.mock';

describe('IssueInvoiceUseCase', () => {
  let useCase: IssueInvoiceUseCase;
  let invoiceRepository: InvoiceRepository;
  let spies: any;

  const now = new Date('2026-01-01T00:00:00Z');

  const company = new Company({
    name: 'Lumminus',
    cnpj: '12345678',
    email: 'luminnus@email.com',
    password: '12345678',
    phoneNumber: '123456443',
    createdAt: now,
    updatedAt: now,
  });

  const otherCompany = new Company({
    name: 'Lummi',
    cnpj: '12678',
    email: 'lumi@email.com',
    password: '12345678',
    phoneNumber: '123456443',
    createdAt: now,
    updatedAt: now,
  });

  const client = new Client({
    fullName: 'John Doe',
    internationalId: '12345665432',
    createdAt: now,
  });

  const clientCompany = new ClientCompany({
    clientId: client.id,
    companyId: company.id,
    email: 'email@email.com',
    phone: '123232132',
    createdAt: now,
    updatedAt: now,
  });

  const service = new Service({
    companyId: company.id,
    name: 'Name',
    description: 'A service',
    basePrice: 12999,
    createdAt: now,
    updatedAt: now,
  });

  const serviceExecution = new ServiceExecution({
    clientCompanyId: clientCompany.id,
    companyId: company.id,
    serviceId: service.id,
    price: service.basePrice,
    status: 'DONE',
    executedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    invoiceRepository = new InMemoryInvoiceRepository();
    const serviceExecutionRepository =
      new InMemoryServiceExecutionRespository();
    const serviceRepository = new InMemoryServiceRepository();
    const clientCompanyRepository = new InMemoryClientCompanyRepository();
    const clientRepository = new InMemoryClientRepository();
    const companyRepository = new InMemoryCompanyRepository();
    const dateTransformService = dateTransformServiceMock;
    const subscriptionPolicyService = SubscriptionPolicyServiceMock;

    useCase = new IssueInvoiceUseCase(
      invoiceRepository,
      serviceExecutionRepository,
      serviceRepository,
      clientCompanyRepository,
      clientRepository,
      companyRepository,
      dateTransformService,
      subscriptionPolicyService,
    );

    spies = {
      invoiceRepository: {
        save: jest.spyOn(invoiceRepository, 'save'),
        findIssuedByServiceExecution: jest.spyOn(
          invoiceRepository,
          'findIssuedByServiceExecution',
        ),
      },
      serviceExecutionRepository: {
        findById: jest.spyOn(serviceExecutionRepository, 'findById'),
      },
      serviceRepository: {
        findById: jest.spyOn(serviceRepository, 'findById'),
      },
      clientCompanyRepository: {
        findById: jest.spyOn(clientCompanyRepository, 'findById'),
      },
      clientRepository: {
        findById: jest.spyOn(clientRepository, 'findById'),
      },
      companyRepository: {
        findById: jest.spyOn(companyRepository, 'findById'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC').mockReturnValue(now),
      },
      subscriptionPolicyService: {
        handle: jest
          .spyOn(subscriptionPolicyService, 'handle')
          .mockResolvedValue(undefined),
      },
    };

    await serviceExecutionRepository.save(serviceExecution);
    await serviceRepository.save(service);
    await clientCompanyRepository.save(clientCompany);
    await clientRepository.save(client);
    await companyRepository.save(company);
    await companyRepository.save(otherCompany);
  });

  const data: IssueInvoiceDTO = {
    companyId: company.id,
    serviceExecutionId: serviceExecution.id,
    timezone: 'America/Sao_Paulo',
  };

  it('should issue a new Invoice', async () => {
    const { invoiceId } = await useCase.handle(data);

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.INVOICE,
    );
    expect(spies.companyRepository.findById).toHaveBeenCalledWith(
      data.companyId,
    );
    expect(spies.serviceExecutionRepository.findById).toHaveBeenCalledWith(
      data.serviceExecutionId,
    );
    expect(
      spies.invoiceRepository.findIssuedByServiceExecution,
    ).toHaveBeenCalledWith(data.serviceExecutionId);
    expect(spies.serviceRepository.findById).toHaveBeenCalledWith(service.id);
    expect(spies.clientCompanyRepository.findById).toHaveBeenCalledWith(
      clientCompany.id,
    );
    expect(spies.clientRepository.findById).toHaveBeenCalledWith(client.id);

    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.invoiceRepository.save).toHaveBeenCalledWith(
      expect.any(Invoice),
    );

    const invoice = await invoiceRepository.findById(invoiceId);

    expect(invoice!.companyId).toBe(data.companyId);
    expect(invoice!.companyName).toBe(company.name);
    expect(invoice!.companyCnpj).toBe(company.cnpj);
    expect(invoice!.companyPhone).toBe(company.phoneNumber);
    expect(invoice!.clientInternationalId).toBe(client.internationalId);
    expect(invoice!.clientName).toBe(client.fullName);
    expect(invoice!.clientPhone).toBe(clientCompany.phone);
    expect(invoice!.serviceExecutionId).toBe(serviceExecution.id);
    expect(invoice!.serviceName).toBe(service.name);
    expect(invoice!.serviceDescription).toBe(service.description);
    expect(invoice!.executedAt).toBe(serviceExecution.executedAt);
    expect(invoice!.price).toBe(serviceExecution.price);
    expect(invoice!.issuedAt).toBe(now);
    expect(invoice!.timezone).toBe(data.timezone);
  });

  it('should throw NonActiveSubscriptionException when the company has not an active subscription', async () => {
    spies.subscriptionPolicyService.handle.mockRejectedValue(
      new NonActiveSubscriptionException('', ''),
    );

    await expect(useCase.handle(data)).rejects.toThrow(
      NonActiveSubscriptionException,
    );
    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.INVOICE,
    );
  });

  it('should throw SubscriptionLimitRecheadException when the company has rechead invoices limit', async () => {
    spies.subscriptionPolicyService.handle.mockRejectedValue(
      new SubscriptionLimitReachedException('', '', ''),
    );

    await expect(useCase.handle(data)).rejects.toThrow(
      SubscriptionLimitReachedException,
    );
    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.INVOICE,
    );
  });

  it('should throw EntityNotFoundException when the company not found', async () => {
    const fakeCompanyId = '123456789765432324567897654';

    await expect(
      useCase.handle({ ...data, companyId: fakeCompanyId }),
    ).rejects.toThrow(EntityNotFoundException);
    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      fakeCompanyId,
      Feature.INVOICE,
    );
    expect(spies.companyRepository.findById).toHaveBeenCalledWith(
      fakeCompanyId,
    );
  });

  it('should throw EntityNotFoundException when the serviceExceution not found', async () => {
    const fakeServiceExecutionId = '123456789765432324567897654';

    await expect(
      useCase.handle({ ...data, serviceExecutionId: fakeServiceExecutionId }),
    ).rejects.toThrow(EntityNotFoundException);
    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.INVOICE,
    );
    expect(spies.companyRepository.findById).toHaveBeenCalledWith(
      data.companyId,
    );
    expect(spies.serviceExecutionRepository.findById).toHaveBeenCalledWith(
      fakeServiceExecutionId,
    );
  });

  it('should throw NonBelongingException when the serviceExceution non belongin the company', async () => {
    await expect(
      useCase.handle({ ...data, companyId: otherCompany.id }),
    ).rejects.toThrow(NonBelongingException);
    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      otherCompany.id,
      Feature.INVOICE,
    );
    expect(spies.companyRepository.findById).toHaveBeenCalledWith(
      otherCompany.id,
    );
    expect(spies.serviceExecutionRepository.findById).toHaveBeenCalledWith(
      data.serviceExecutionId,
    );
  });

  it('should throw AlreadyExistException when already exist a invoice of the serviceExecution', async () => {
    await useCase.handle(data);

    await expect(useCase.handle(data)).rejects.toThrow(AlreadyExistException);

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.INVOICE,
    );
    expect(spies.companyRepository.findById).toHaveBeenCalledWith(
      data.companyId,
    );
    expect(spies.serviceExecutionRepository.findById).toHaveBeenCalledWith(
      data.serviceExecutionId,
    );
    expect(spies.serviceExecutionRepository.findById).toHaveBeenCalledWith(
      data.serviceExecutionId,
    );
  });
});
