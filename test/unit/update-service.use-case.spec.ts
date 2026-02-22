/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PriceConverter } from 'src/application/common/price-converter.common';
import { UpdateServiceDTO } from 'src/application/dtos/update-service.dto';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';
import { DateTransformService } from 'src/application/services/date-transform.service';
import { UpdateServiceUseCase } from 'src/application/use-cases/update-service.use-case';
import { Service } from 'src/domain/entities/service';
import { ServiceRespository } from 'src/domain/repositories/service.repository';
import { InMemoryServiceRepository } from 'test/utils/in-memory/in-memory.service-repository';
import { dateTransformMock } from 'test/utils/mocks/date-transform.mock';

describe('UpdateServiceUseCase', () => {
  let useCase: UpdateServiceUseCase;
  let repository: ServiceRespository;
  let dateTransformService: DateTransformService;
  let spies: any;

  const serviceId = '1';
  const companyId = '2';

  const serviceMock = new Service({
    id: serviceId,
    name: 'Service',
    companyId,
    description: 'A service',
    basePrice: 99.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const data: UpdateServiceDTO = {
    companyId,
    serviceId,
    description: 'A description',
    basePrice: 129.99,
  };

  const fakeNowUTC = new Date();

  beforeEach(() => {
    jest.clearAllMocks();

    repository = new InMemoryServiceRepository();
    dateTransformService = dateTransformMock;
    useCase = new UpdateServiceUseCase(repository, dateTransformService);
    spies = {
      serviceRepository: {
        findById: jest.spyOn(repository, 'findById'),
        update: jest.spyOn(repository, 'update'),
      },
      priceConverter: {
        toRepository: jest.spyOn(PriceConverter, 'toRepository'),
      },
      service: {
        update: jest.spyOn(serviceMock, 'update'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC'),
      },
    };

    spies.dateTransformService.nowUTC.mockReturnValue(fakeNowUTC);
  });

  it('should update a service', async () => {
    await repository.save(serviceMock);

    const response = await useCase.handle(data);

    expect(spies.priceConverter.toRepository).toHaveBeenCalledWith(
      data.basePrice,
    );
    expect(spies.serviceRepository.findById).toHaveBeenCalledWith(serviceId);
    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.service.update).toHaveBeenCalledWith({
      description: data.description,
      basePrice: data.basePrice! * 100,
      now: fakeNowUTC,
    });
    expect(spies.serviceRepository.update).toHaveBeenCalledWith(
      expect.any(Service),
    );

    expect(response.service.description).toBe(data.description);
    expect(response.service.basePrice).toBe(data.basePrice! * 100);
    expect(response.service.updatedAt).toBe(fakeNowUTC);
  });

  it('should throw a EntityNotFoundException when serviceId is invalid', async () => {
    await repository.save(serviceMock);

    const fakeId = '123456';

    await expect(
      useCase.handle({ ...data, serviceId: fakeId }),
    ).rejects.toThrow(EntityNotFoundException);

    expect(spies.serviceRepository.findById).toHaveBeenCalledWith(fakeId);
  });

  it('should throw a NonBelongingException when service belong not the company', async () => {
    await repository.save(serviceMock);

    const fakeCompanyId = '123456';

    await expect(
      useCase.handle({ ...data, companyId: fakeCompanyId }),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.serviceRepository.findById).toHaveBeenCalledWith(serviceId);
  });
});
