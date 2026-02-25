/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CancelSubscriptionDTO } from 'src/application/dtos/cancel-subscription.dto';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';
import { CancelSubscriptionUseCase } from 'src/application/use-cases/cancel-subscription.use-case';
import { Subscription } from 'src/domain/entities/subscription';
import { SubscriptionException } from 'src/domain/exceptions/subscription.exception';
import { SubscriptionRepository } from 'src/domain/repositories/subscription.repository';
import { InMemorySubscriptionRepository } from 'test/utils/in-memory/in-memory.subscription-repository';
import { dateTransformServiceMock } from 'test/utils/mocks/date-transform-service.mock';

describe('CancelSubscriptionUseCase', () => {
  let useCase: CancelSubscriptionUseCase;
  let subscriptionRepository: SubscriptionRepository;
  let spies: any;

  const companyId = '12234';
  const now = new Date('2026-01-01T00:00:00Z');

  const subscription = new Subscription({
    id: '1',
    companyId,
    planId: '12345',
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

  const data: CancelSubscriptionDTO = {
    companyId,
    subscriptionId: subscription.id,
  };

  beforeEach(async () => {
    subscriptionRepository = new InMemorySubscriptionRepository();
    const dateTransformService = dateTransformServiceMock;
    useCase = new CancelSubscriptionUseCase(
      subscriptionRepository,
      dateTransformService,
    );

    spies = {
      subscriptionRepository: {
        findById: jest.spyOn(subscriptionRepository, 'findById'),
        update: jest.spyOn(subscriptionRepository, 'update'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC').mockReturnValue(now),
      },
      subscription: {
        cancelAtPeriodEnd: jest.spyOn(subscription, 'cancelAtPeriodEnd'),
      },
    };

    await subscriptionRepository.save(subscription);
  });

  it('should cancel subscription', async () => {
    await useCase.handle(data);

    expect(spies.subscriptionRepository.findById).toHaveBeenCalledWith(
      data.subscriptionId,
    );
    expect(spies.subscription.cancelAtPeriodEnd).toHaveBeenCalledWith(now);
    expect(spies.subscriptionRepository.update).toHaveBeenCalled();

    const subscriptionCanceled = await subscriptionRepository.findById(
      subscription.id,
    );

    expect(subscriptionCanceled!.autoRenew).toBe(false);
  });

  it('should throw EntityNotFoundException when the subscription not exists', async () => {
    const fakeSubscriptionId = '1234567890';

    await expect(
      useCase.handle({
        companyId: data.companyId,
        subscriptionId: fakeSubscriptionId,
      }),
    ).rejects.toThrow(EntityNotFoundException);

    expect(spies.subscriptionRepository.findById).toHaveBeenCalledWith(
      fakeSubscriptionId,
    );
  });

  it('should throw NonBelongingException when the subscription not belong to the company', async () => {
    const fakeCompanyId = '12345678900987654321';

    await expect(
      useCase.handle({
        companyId: fakeCompanyId,
        subscriptionId: data.subscriptionId,
      }),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.subscriptionRepository.findById).toHaveBeenCalledWith(
      data.subscriptionId,
    );
  });

  it('should throw a SubscriptionException when try cancel a alredy canceled subscription', async () => {
    const subscriptionCanceled = new Subscription({
      id: subscription.id,
      companyId,
      planId: subscription.planId,
      planName: subscription.planName,
      planType: subscription.planType,
      price: subscription.price,
      servicesLimit: subscription.servicesLimit,
      serviceExecutionsLimit: subscription.serviceExecutionsLimit,
      clientCompanysLimit: subscription.clientCompanysLimit,
      invoicesLimit: subscription.invoicesLimit,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      autoRenew: false,
    });

    await subscriptionRepository.update(subscriptionCanceled);

    await expect(useCase.handle(data)).rejects.toThrow(SubscriptionException);

    expect(spies.subscription.cancelAtPeriodEnd).toHaveBeenCalledWith(now);
    expect(spies.subscriptionRepository.update).toHaveBeenCalled();
  });

  it('should throw a SubscriptionException when try cancel a expired subscription', async () => {
    const subscriptionExpired = new Subscription({
      id: subscription.id,
      companyId,
      planId: subscription.planId,
      planName: subscription.planName,
      planType: subscription.planType,
      price: subscription.price,
      status: 'EXPIRED',
      servicesLimit: subscription.servicesLimit,
      serviceExecutionsLimit: subscription.serviceExecutionsLimit,
      clientCompanysLimit: subscription.clientCompanysLimit,
      invoicesLimit: subscription.invoicesLimit,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      autoRenew: false,
    });

    await subscriptionRepository.update(subscriptionExpired);

    await expect(useCase.handle(data)).rejects.toThrow(SubscriptionException);

    expect(spies.subscription.cancelAtPeriodEnd).toHaveBeenCalledWith(now);
    expect(spies.subscriptionRepository.update).toHaveBeenCalled();
  });
});
