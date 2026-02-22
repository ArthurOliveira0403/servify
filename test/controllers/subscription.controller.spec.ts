/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { Subscription } from 'src/domain/entities/subscription';
import { CancelSubscriptionUseCase } from 'src/application/use-cases/cancel-subscription.use-case';
import { CreateSusbcriptionUseCase } from 'src/application/use-cases/create-subscription.use-case';
import { ListActiveSubscriptionUseCase } from 'src/application/use-cases/list-active-subscription.use-case';
import { SubscriptionController } from 'src/infra/http/controllers/subscription.controller';
import { SubscriptionResponseMapper } from 'src/infra/http/mappers/subscription-response.mapper';
import { AuthUser } from 'src/application/common/auth-user.interface';
import { AlreadyExistException } from 'src/application/exceptions/already-exist.exception';
import { UserNotFoundException } from 'src/infra/exceptions/user-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';

const createSubscriptionUseCaseMock = {
  provide: CreateSusbcriptionUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const listActiveSubscriptionUseCaseMock = {
  provide: ListActiveSubscriptionUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const cancelSubscriptionUseCaseMock = {
  provide: CancelSubscriptionUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const subscriptionResponseMapperMock = {
  provide: SubscriptionResponseMapper,
  useValue: {
    handle: jest.fn(),
  },
};

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let spies: any;

  const user: AuthUser = {
    id: '1',
    email: 'email@email.com',
    role: 'COMPANY',
  };

  const now = new Date();

  const planId = '12345';
  const subscriptionId = '12345';

  const timzone = 'America/Sao_Paulo';

  const subscription = new Subscription({
    id: subscriptionId,
    companyId: user.id,
    planId,
    planName: 'BASIC',
    planType: 'MONTHLY',
    price: 19999,
    servicesLimit: 12,
    serviceExecutionsLimit: 12,
    clientCompanysLimit: 12,
    invoicesLimit: 12,
    startDate: now,
    endDate: new Date(new Date(now).setMonth(now.getMonth() + 1)),
  });

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        createSubscriptionUseCaseMock,
        listActiveSubscriptionUseCaseMock,
        cancelSubscriptionUseCaseMock,
        subscriptionResponseMapperMock,
      ],
    }).compile();

    controller = moduleRef.get(SubscriptionController);

    const createSubscriptionUseCase = moduleRef.get(CreateSusbcriptionUseCase);
    const listActiveSubscriptionUseCase = moduleRef.get(
      ListActiveSubscriptionUseCase,
    );
    const cancelSubscriptionUseCase = moduleRef.get(CancelSubscriptionUseCase);
    const subscriptionResponseMapper = moduleRef.get(
      SubscriptionResponseMapper,
    );

    spies = {
      createSubscriptionUseCase: {
        handle: jest.spyOn(createSubscriptionUseCase, 'handle'),
      },
      listActiveSubscriptionUseCase: {
        handle: jest.spyOn(listActiveSubscriptionUseCase, 'handle'),
      },
      cancelSubscriptionUseCase: {
        handle: jest.spyOn(cancelSubscriptionUseCase, 'handle'),
      },
      subscriptionResponseMapper: {
        handle: jest.spyOn(subscriptionResponseMapper, 'handle'),
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== Create method ====================
  it('should create a new Subcription', async () => {
    spies.createSubscriptionUseCase.handle.mockResolvedValue({
      subscriptionId,
    });

    const response = await controller.create(user, planId);

    expect(spies.createSubscriptionUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
      planId,
    });
    expect(response.message).toBe('Subscription succesfully created');
    expect(response.subscriptionId).toBe(subscriptionId);
  });

  it('should throw AlreadyExistException when already exists an active Subscription', async () => {
    spies.createSubscriptionUseCase.handle.mockRejectedValue(
      new AlreadyExistException('', '', ''),
    );

    await expect(controller.create(user, planId)).rejects.toThrow(
      AlreadyExistException,
    );
    expect(spies.createSubscriptionUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
      planId,
    });
  });

  it('should throw UserNotFoundException when the plan not exist or the plan type does not register in Usecase', async () => {
    spies.createSubscriptionUseCase.handle.mockRejectedValue(
      new UserNotFoundException('', ''),
    );

    await expect(controller.create(user, planId)).rejects.toThrow(
      UserNotFoundException,
    );
    expect(spies.createSubscriptionUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
      planId,
    });
  });

  // ==================== getActive method ====================
  it("should list company's active subscription", async () => {
    spies.listActiveSubscriptionUseCase.handle.mockResolvedValue({
      subscription,
    });
    spies.subscriptionResponseMapper.handle.mockReturnValue(subscription);

    const response = await controller.getActive(user, timzone);

    expect(spies.listActiveSubscriptionUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
    });
    expect(spies.subscriptionResponseMapper.handle).toHaveBeenCalledWith(
      subscription,
      timzone,
    );
    expect(response.subscription).toEqual(subscription);
  });

  it('should return "null" when not exist active subscription of company', async () => {
    spies.listActiveSubscriptionUseCase.handle.mockResolvedValue({
      subscription: null,
    });

    const response = await controller.getActive(user, timzone);

    expect(spies.listActiveSubscriptionUseCase.handle).toHaveBeenCalledWith({
      companyId: user.id,
    });
    expect(spies.subscriptionResponseMapper.handle).not.toHaveBeenCalled();
    expect(response.subscription).toBe(null);
  });

  // ==================== cancel method ====================
  it('should cancel subscription', async () => {
    const response = await controller.cancel(user, subscriptionId);

    expect(spies.cancelSubscriptionUseCase.handle).toHaveBeenCalledWith({
      subscriptionId,
      companyId: user.id,
    });

    expect(response.message).toBe('Successfully subscription canceled');
  });

  it('should throw a UserNotFoundException when the subscription not exist', async () => {
    spies.cancelSubscriptionUseCase.handle.mockRejectedValue(
      new UserNotFoundException('', ''),
    );

    await expect(controller.cancel(user, subscriptionId)).rejects.toThrow(
      UserNotFoundException,
    );

    expect(spies.cancelSubscriptionUseCase.handle).toHaveBeenCalledWith({
      subscriptionId,
      companyId: user.id,
    });
  });

  it('should throw a UnauthorizedException when the subscription not belong to the company', async () => {
    const fakeId = 'fakeId';

    spies.cancelSubscriptionUseCase.handle.mockRejectedValue(
      new NonBelongingException('', '', ''),
    );

    await expect(
      controller.cancel({ ...user, id: fakeId }, subscriptionId),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.cancelSubscriptionUseCase.handle).toHaveBeenCalledWith({
      subscriptionId,
      companyId: fakeId,
    });
  });
});
