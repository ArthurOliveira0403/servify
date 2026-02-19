/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateServiceUseCase } from 'src/application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from 'src/application/use-cases/delete-service.use-case';
import { ListServicesUseCase } from 'src/application/use-cases/list-services.use-case';
import { UpdateServiceUseCase } from 'src/application/use-cases/update-service.use-case';
import { Service } from 'src/domain/entities/service';
import { ServiceController } from 'src/infra/http/controllers/service.controller';
import { ServiceReponseMapper } from 'src/infra/http/mappers/service-response.mapper';
import { SubscriptionModule } from 'src/infra/modules/subscription.module';
import { DateTrasnformModule } from 'src/infra/modules/date-transform.module';
import { AuthUser } from 'src/application/common/auth-user.interface';
import { UpdateServiceBodyDTO } from 'src/infra/schemas/update-service.schemas';

const createServiceUseCaseMock = {
  provide: CreateServiceUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const listServicesUseCaseMock = {
  provide: ListServicesUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const updateServiceUseCaseMock = {
  provide: UpdateServiceUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const deleteServiceUseCaseMock = {
  provide: DeleteServiceUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

describe('ServiceController', () => {
  let serviceController: ServiceController;
  let spies: any;

  const user: AuthUser = {
    id: '1',
    email: 'email@email.com',
    role: 'COMPANY',
  };

  const dataToCreate = {
    name: 'Service',
    description: 'A complete Service',
    basePrice: 2345.67,
  };

  const serviceMock1Id = '1';

  const dataToUpdate: UpdateServiceBodyDTO = {
    name: 'Tire repair',
    description: 'A complete tire repair',
    basePrice: 69.99,
  };

  const serviceMock1 = new Service({
    id: serviceMock1Id,
    companyId: user.id,
    name: 'Service',
    description: 'A complete Service',
    basePrice: 2345.67,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const serviceMock2 = new Service({
    companyId: user.id,
    name: 'Tire repair',
    description: 'A complete tire repair',
    basePrice: 69.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const serviceMock3 = new Service({
    companyId: user.id,
    name: 'Oil change',
    description: 'A complete car repair',
    basePrice: 200.15,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SubscriptionModule, DateTrasnformModule],
      providers: [
        createServiceUseCaseMock,
        listServicesUseCaseMock,
        updateServiceUseCaseMock,
        deleteServiceUseCaseMock,
      ],
      controllers: [ServiceController],
    }).compile();

    serviceController = moduleRef.get(ServiceController);
    const createServiceUseCase = moduleRef.get(CreateServiceUseCase);
    const listServicesUseCase = moduleRef.get(ListServicesUseCase);
    const updateServiceUseCase = moduleRef.get(UpdateServiceUseCase);
    const deleteServiceUseCase = moduleRef.get(DeleteServiceUseCase);

    spies = {
      createServiceUseCase: {
        handle: jest.spyOn(createServiceUseCase, 'handle'),
      },
      listServicesUseCase: {
        handle: jest.spyOn(listServicesUseCase, 'handle'),
      },
      updateServiceUseCase: {
        handle: jest.spyOn(updateServiceUseCase, 'handle'),
      },
      deleteServiceUseCase: {
        handle: jest.spyOn(deleteServiceUseCase, 'handle'),
      },
      serviceResponseMapper: {
        unique: jest.spyOn(ServiceReponseMapper, 'unique'),
        various: jest.spyOn(ServiceReponseMapper, 'various'),
      },
    };
  });

  // ==================== Create method ====================
  it('should create a Service', async () => {
    spies.createServiceUseCase.handle.mockResolvedValue({
      serviceId: serviceMock1Id,
    });

    const response = await serviceController.create(user, dataToCreate);

    expect(spies.createServiceUseCase.handle).toHaveBeenCalledWith({
      ...dataToCreate,
      companyId: user.id,
    });
    expect(response.message).toBe('Service successfully created');
    expect(response.serviceId).toBe(serviceMock1Id);
  });

  // ==================== List method ====================
  it('should list all Services by company', async () => {
    const responseUseCase = [serviceMock1, serviceMock2, serviceMock3];
    spies.listServicesUseCase.handle.mockResolvedValue(responseUseCase);

    spies.serviceResponseMapper.various.mockReturnValue(responseUseCase);

    const services = await serviceController.listAll(user);

    expect(spies.listServicesUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
    });
    expect(services).toEqual(responseUseCase);
  });

  it('should return [] when company have not services', async () => {
    spies.serviceResponseMapper.various.mockReturnValue([]);

    const services = await serviceController.listAll(user);

    expect(spies.listServicesUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
    });
    expect(services).toEqual([]);
  });

  // ==================== Update method ====================
  it('should update a Service', async () => {
    const serviceUpdated = new Service({
      id: serviceMock1Id,
      companyId: serviceMock1.companyId,
      name: dataToUpdate.name!,
      description: dataToUpdate.description!,
      basePrice: dataToUpdate.basePrice!,
      createdAt: serviceMock1.createdAt,
      updatedAt: serviceMock1.updatedAt,
    });

    spies.updateServiceUseCase.handle.mockResolvedValue({
      service: serviceUpdated,
    });

    const response = await serviceController.update(
      user,
      serviceMock1Id,
      dataToUpdate,
    );

    expect(spies.updateServiceUseCase.handle).toHaveBeenCalledWith({
      ...dataToUpdate,
      serviceId: serviceMock1Id,
      companyId: user.id,
    });

    expect(spies.serviceResponseMapper.unique).toHaveBeenCalled();

    expect(response.message).toBe('Successfully service updated');
    expect(response.service).toEqual(
      ServiceReponseMapper.unique(serviceUpdated),
    );
  });

  it('should throw NotFoundException when the service exist not', async () => {
    spies.updateServiceUseCase.handle.mockRejectedValue(
      new NotFoundException(),
    );

    const fakeServiceId = '1234567';

    await expect(
      serviceController.update(user, fakeServiceId, dataToUpdate),
    ).rejects.toThrow(NotFoundException);
    expect(spies.updateServiceUseCase.handle).toHaveBeenCalledWith({
      ...dataToUpdate,
      serviceId: fakeServiceId,
      companyId: user.id,
    });
  });

  it('should throw ForbiddenException when the service belong not the company', async () => {
    spies.updateServiceUseCase.handle.mockRejectedValue(
      new ForbiddenException(),
    );

    const fakeCompanyId = '1234567';

    await expect(
      serviceController.update(
        { ...user, id: fakeCompanyId },
        serviceMock1Id,
        dataToUpdate,
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(spies.updateServiceUseCase.handle).toHaveBeenCalledWith({
      ...dataToUpdate,
      serviceId: serviceMock1Id,
      companyId: fakeCompanyId,
    });
  });

  // ==================== Delete method ====================
  it('should delete a Service', async () => {
    spies.deleteServiceUseCase.handle.mockResolvedValue(undefined);

    const response = await serviceController.delete(user, serviceMock1Id);

    expect(spies.deleteServiceUseCase.handle).toHaveBeenCalledWith({
      serviceId: serviceMock1Id,
      companyId: user.id,
    });
    expect(response.message).toBe('Successfully service deleted');
  });

  it('should throw NotFoundException when the service exist not', async () => {
    spies.deleteServiceUseCase.handle.mockRejectedValue(
      new NotFoundException(),
    );

    const fakeServiceId = '123456';

    await expect(serviceController.delete(user, fakeServiceId)).rejects.toThrow(
      NotFoundException,
    );
    expect(spies.deleteServiceUseCase.handle).toHaveBeenCalledWith({
      serviceId: fakeServiceId,
      companyId: user.id,
    });
  });

  it('should throw NotFoundException when the service belong not the company', async () => {
    spies.deleteServiceUseCase.handle.mockRejectedValue(
      new ForbiddenException(),
    );

    const fakeCompanyId = '123456';

    await expect(
      serviceController.delete({ ...user, id: fakeCompanyId }, serviceMock1Id),
    ).rejects.toThrow(ForbiddenException);
    expect(spies.deleteServiceUseCase.handle).toHaveBeenCalledWith({
      serviceId: serviceMock1Id,
      companyId: fakeCompanyId,
    });
  });
});
