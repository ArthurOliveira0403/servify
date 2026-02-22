/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';
import { DeleteServiceUseCase } from 'src/application/use-cases/delete-service.use-case';
import { Service } from 'src/domain/entities/service';
import { ServiceRespository } from 'src/domain/repositories/service.repository';
import { InMemoryServiceRepository } from 'test/utils/in-memory/in-memory.service-repository';

describe('DeleteServiceUseCase', () => {
  let useCase: DeleteServiceUseCase;
  let repository: ServiceRespository;
  let spies: any;

  const companyId = '1232456';
  const serviceId = '1';

  const serviceMock = new Service({
    id: serviceId,
    name: 'Service',
    companyId,
    description: 'A service',
    basePrice: 159.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    repository = new InMemoryServiceRepository();
    useCase = new DeleteServiceUseCase(repository);

    spies = {
      serviceRespository: {
        findById: jest.spyOn(repository, 'findById'),
        delete: jest.spyOn(repository, 'delete'),
      },
    };

    await repository.save(serviceMock);
  });

  it('should delete a company', async () => {
    await useCase.handle({ serviceId, companyId });

    expect(spies.serviceRespository.findById).toHaveBeenCalledWith(serviceId);
    expect(spies.serviceRespository.delete).toHaveBeenCalledWith(serviceId);

    const service = await repository.findById(serviceId);
    expect(service).toBeNull();
  });

  it('should throw a EntityNotFoundException when serviceId is invalid', async () => {
    const fakeServiceId = '123456';

    await expect(
      useCase.handle({ serviceId: fakeServiceId, companyId }),
    ).rejects.toThrow(EntityNotFoundException);

    expect(spies.serviceRespository.findById).toHaveBeenLastCalledWith(
      fakeServiceId,
    );
  });

  it('should throw a NonBelonginException when the service belong not the company', async () => {
    const fakeCompanyId = '123456';

    await expect(
      useCase.handle({ serviceId, companyId: fakeCompanyId }),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.serviceRespository.findById).toHaveBeenLastCalledWith(
      serviceId,
    );
  });
});
