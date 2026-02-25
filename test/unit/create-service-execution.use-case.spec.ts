/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CreateServiceExecutionDTO } from 'src/application/dtos/create-service-execution.dto';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';
import { CreateServiceExecutionUseCase } from 'src/application/use-cases/create-service-execution.use-case';
import { ClientCompany } from 'src/domain/entities/client-company';
import { Service } from 'src/domain/entities/service';
import { ServiceExecution } from 'src/domain/entities/service-execution';
import { Feature } from 'src/domain/entities/subscription';
import { ClientCompanyRepository } from 'src/domain/repositories/client-company.repository';
import { ServiceExecutionRepository } from 'src/domain/repositories/service-execution.repository';
import { ServiceRespository } from 'src/domain/repositories/service.repository';
import { InMemoryClientCompanyRepository } from 'test/utils/in-memory/in-memory.client-company.repository';
import { InMemoryServiceExecutionRespository } from 'test/utils/in-memory/in-memory.service-execution-repository';
import { InMemoryServiceRepository } from 'test/utils/in-memory/in-memory.service-repository';
import { dateTransformServiceMock } from 'test/utils/mocks/date-transform-service.mock';
import { SubscriptionPolicyServiceMock } from 'test/utils/mocks/subscription-policy-service.mock';

describe('CreateServiceExecutionUseCase', () => {
  let useCase: CreateServiceExecutionUseCase;
  let serviceExecutionRepository: ServiceExecutionRepository;
  let serviceRepository: ServiceRespository;
  let clientCompanyRepository: ClientCompanyRepository;
  let spies: any;

  const companyId = '1';

  const serviceMock = new Service({
    companyId,
    name: 'A service',
    description: 'A description',
    basePrice: 299.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const clientCompanyMock = new ClientCompany({
    companyId,
    clientId: '2',
    email: 'email@email.com',
    phone: '1223468',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const data: CreateServiceExecutionDTO = {
    companyId,
    clientCompanyId: clientCompanyMock.id,
    serviceId: serviceMock.id,
    executedAt: '2025-02-01',
  };

  beforeEach(() => {
    serviceExecutionRepository = new InMemoryServiceExecutionRespository();
    serviceRepository = new InMemoryServiceRepository();
    clientCompanyRepository = new InMemoryClientCompanyRepository();
    const dateTransformService = dateTransformServiceMock;
    const subscriptionPolicyService = SubscriptionPolicyServiceMock;

    useCase = new CreateServiceExecutionUseCase(
      serviceExecutionRepository,
      serviceRepository,
      clientCompanyRepository,
      dateTransformService,
      subscriptionPolicyService,
    );

    spies = {
      subscriptionPolicyService: {
        handle: jest.spyOn(subscriptionPolicyService, 'handle'),
      },
      serviceRepository: {
        findById: jest.spyOn(serviceRepository, 'findById'),
      },
      clientCompanyRepository: {
        findById: jest.spyOn(clientCompanyRepository, 'findById'),
      },
      serviceExecutionRepository: {
        save: jest.spyOn(serviceExecutionRepository, 'save'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC'),
      },
    };
  });

  it('should create a Service Execution', async () => {
    await serviceRepository.save(serviceMock);
    await clientCompanyRepository.save(clientCompanyMock);

    const response = await useCase.handle(data);

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.SERVICE_EXECUTION,
    );

    expect(spies.serviceRepository.findById).toHaveBeenCalledWith(
      data.serviceId,
    );
    expect(spies.clientCompanyRepository.findById).toHaveBeenCalledWith(
      data.clientCompanyId,
    );
    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.serviceExecutionRepository.save).toHaveBeenCalledWith(
      expect.any(ServiceExecution),
    );

    const serviceExecutionId = (
      await serviceExecutionRepository.findManyByCompany(data.companyId)
    )[0].id;

    expect(response.serviceExecutionId).toBe(serviceExecutionId);
  });

  it('should throw EntityNotFoundException when the service does not exists', async () => {
    await serviceRepository.save(serviceMock);
    await clientCompanyRepository.save(clientCompanyMock);

    const fakeServiceId = '1234567890';

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.SERVICE_EXECUTION,
    );

    await expect(
      useCase.handle({ ...data, serviceId: fakeServiceId }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException when the clientCompany does not exists', async () => {
    await serviceRepository.save(serviceMock);
    await clientCompanyRepository.save(clientCompanyMock);

    const fakeClienCompanyId = '1234567890';

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.SERVICE_EXECUTION,
    );

    await expect(
      useCase.handle({ ...data, clientCompanyId: fakeClienCompanyId }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw a NonBelongingException when the Service companyId does not match with the ClientCompany companyId', async () => {
    await serviceRepository.save(serviceMock);
    await clientCompanyRepository.save(clientCompanyMock);

    const otherServiceMock = new Service({
      companyId: '1234567890',
      name: 'A name',
      description: 'A description',
      basePrice: 129.99,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await serviceRepository.save(otherServiceMock);

    await expect(
      useCase.handle({ ...data, serviceId: otherServiceMock.id }),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.SERVICE_EXECUTION,
    );
  });

  it('should throw a NonBelongingException when the Service companyId does not match with the "User" companyId', async () => {
    await serviceRepository.save(serviceMock);
    await clientCompanyRepository.save(clientCompanyMock);

    const otherCompanyId = '1234567890';

    await expect(
      useCase.handle({ ...data, companyId: otherCompanyId }),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.SERVICE_EXECUTION,
    );
  });
});
