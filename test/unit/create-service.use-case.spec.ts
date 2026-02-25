/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PriceConverter } from 'src/application/common/price-converter.common';
import { CreateServiceDTO } from 'src/application/dtos/create-service.dto';
import { CreateServiceUseCase } from 'src/application/use-cases/create-service.use-case';
import { Service } from 'src/domain/entities/service';
import { Feature } from 'src/domain/entities/subscription';
import { ServiceRespository } from 'src/domain/repositories/service.repository';
import { InMemoryServiceRepository } from 'test/utils/in-memory/in-memory.service-repository';
import { dateTransformServiceMock } from 'test/utils/mocks/date-transform-service.mock';
import { SubscriptionPolicyServiceMock } from 'test/utils/mocks/subscription-policy-service.mock';

describe('createServiceUseCase', () => {
  let useCase: CreateServiceUseCase;
  let serviceRepository: ServiceRespository;
  let spies: any;

  const data: CreateServiceDTO = {
    companyId: '1',
    name: 'Service',
    description: 'A service',
    basePrice: 200,
  };

  beforeEach(() => {
    serviceRepository = new InMemoryServiceRepository();
    const dateTransformService = dateTransformServiceMock;
    const subscriptionPolicyService = SubscriptionPolicyServiceMock;
    useCase = new CreateServiceUseCase(
      serviceRepository,
      dateTransformService,
      subscriptionPolicyService,
    );

    spies = {
      subscriptionPolicyService: {
        handle: jest.spyOn(subscriptionPolicyService, 'handle'),
      },
      serviceRepository: {
        save: jest.spyOn(serviceRepository, 'save'),
      },
      priceConverter: {
        toRepository: jest.spyOn(PriceConverter, 'toRepository'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC'),
      },
    };
  });

  it('should save a service', async () => {
    const response = await useCase.handle(data);

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.SERVICE,
    );

    expect(spies.priceConverter.toRepository).toHaveBeenCalledWith(
      data.basePrice,
    );
    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.serviceRepository.save).toHaveBeenLastCalledWith(
      expect.any(Service),
    );

    const serviceId = (
      await serviceRepository.findManyByCompany(data.companyId)
    )[0].id;

    expect(response.serviceId).toBe(serviceId);
  });
});
