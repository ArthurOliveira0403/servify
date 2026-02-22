/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ListServicesUseCase } from 'src/application/use-cases/list-services.use-case';
import { Service } from 'src/domain/entities/service';
import { ServiceRespository } from 'src/domain/repositories/service.repository';
import { InMemoryServiceRepository } from 'test/utils/in-memory/in-memory.service-repository';

describe('ListServicesUseCase', () => {
  let useCase: ListServicesUseCase;
  let repository: ServiceRespository;
  let spies: any;

  const companyId = '1';

  const serviceMock = new Service({
    companyId: companyId,
    name: 'Service',
    description: 'A service',
    basePrice: 200,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const serviceMock2 = new Service({
    companyId: companyId,
    name: 'Full Service',
    description: 'A service',
    basePrice: 99.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const serviceMock3 = new Service({
    companyId: companyId,
    name: 'Simple Service',
    description: 'A service',
    basePrice: 159.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    repository = new InMemoryServiceRepository();
    useCase = new ListServicesUseCase(repository);

    await repository.save(serviceMock);
    await repository.save(serviceMock2);
    await repository.save(serviceMock3);

    spies = {
      serviceRepository: {
        findManyByCompany: jest.spyOn(repository, 'findManyByCompany'),
      },
    };
  });

  it('should list services', async () => {
    const services = await useCase.handle({ companyId });

    expect(spies.serviceRepository.findManyByCompany).toHaveBeenCalledWith(
      companyId,
    );
    expect(services).toEqual([serviceMock, serviceMock2, serviceMock3]);
  });

  it('should return a "[]" when the company has not services', async () => {
    const fakeId = '123456';

    const services = await useCase.handle({ companyId: fakeId });

    expect(spies.serviceRepository.findManyByCompany).toHaveBeenCalledWith(
      fakeId,
    );
    expect(services).toEqual([]);
  });
});
