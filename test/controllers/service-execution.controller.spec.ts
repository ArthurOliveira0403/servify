/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateServiceExecutionUseCase } from 'src/application/use-cases/create-service-execution.use-case';
import { AuthUser } from 'src/application/common/auth-user.interface';
import { ServiceExecutionController } from 'src/infra/http/controllers/service-execution.controller';
import { DateTrasnformModule } from 'src/infra/modules/date-transform.module';
import { SubscriptionModule } from 'src/infra/modules/subscription.module';

const createServiceExecutionUseCaseMock = {
  provide: CreateServiceExecutionUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

describe('ServiceExecutionController', () => {
  let serviceExecutionController: ServiceExecutionController;
  let spies: any;

  const user: AuthUser = {
    id: '1',
    email: 'email@email.com',
    role: 'COMPANY',
  };

  const data = {
    serviceId: '1',
    clientCompanyId: '1',
    executedAt: '2026-02-01',
  };

  const serviceExecutionId = '1';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SubscriptionModule, DateTrasnformModule],
      controllers: [ServiceExecutionController],
      providers: [createServiceExecutionUseCaseMock],
    }).compile();

    serviceExecutionController = moduleRef.get(ServiceExecutionController);
    const createServiceExecutionUseCase = moduleRef.get(
      CreateServiceExecutionUseCase,
    );

    spies = {
      createServiceExecutionUseCase: {
        handle: jest.spyOn(createServiceExecutionUseCase, 'handle'),
      },
    };
  });

  it('should create a ServiceExecution', async () => {
    spies.createServiceExecutionUseCase.handle.mockResolvedValue({
      serviceExecutionId,
    });

    const response = await serviceExecutionController.create(user, data);

    expect(response.message).toBe('Service execution successfully created');
  });

  it('should throw a NotFoundExeption when the Service does not exists OR ClienCompany does not exists', async () => {
    spies.createServiceExecutionUseCase.handle.mockRejectedValue(
      new NotFoundException(),
    );

    await expect(serviceExecutionController.create(user, data)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw a BadRequestException when the companyIds does not match', async () => {
    spies.createServiceExecutionUseCase.handle.mockRejectedValue(
      new BadRequestException(),
    );

    await expect(serviceExecutionController.create(user, data)).rejects.toThrow(
      BadRequestException,
    );
  });
});
