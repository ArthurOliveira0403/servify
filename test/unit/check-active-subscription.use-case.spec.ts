/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Subscription } from 'src/domain/entities/subscription';
import { CheckActiveSubscriptionUseCase } from 'src/application/use-cases/check-active-subscription.use-case';
import { SubscriptionRepository } from 'src/domain/repositories/subscription.repository';
import { InMemorySubscriptionRepository } from 'test/utils/in-memory/in-memory.subscription-repository';
import { dateTransformServiceMock } from 'test/utils/mocks/date-transform-service.mock';

describe('CheckActiveSubscriptionUseCase', () => {
  let useCase: CheckActiveSubscriptionUseCase;
  let repository: SubscriptionRepository;
  let spies: any;

  const now = new Date('2026-01-01T00:00:00Z');
  const old = new Date('2024-01-01T00:00:00Z');

  const companyId1 = '1234567890';
  const companyId2 = '123453245643';
  const companyId3 = '123432134564345678';

  const subscripton1 = new Subscription({
    id: '1',
    companyId: companyId1,
    planId: '12345',
    planName: 'BASIC',
    planType: 'MONTHLY',
    price: 19999,
    servicesLimit: 12,
    serviceExecutionsLimit: 12,
    clientCompanysLimit: 12,
    invoicesLimit: 12,
    startDate: now,
    endDate: new Date(new Date(now).setMonth(now.getFullYear() + 1)),
  });

  const subscripton2 = new Subscription({
    id: '1',
    companyId: companyId2,
    planId: '12345',
    planName: 'BASIC',
    planType: 'YEARLY',
    price: 59999,
    status: 'EXPIRED',
    servicesLimit: 200,
    serviceExecutionsLimit: 200,
    clientCompanysLimit: 200,
    invoicesLimit: 200,
    startDate: old,
    endDate: new Date(new Date(old).setMonth(old.getFullYear() + 1)),
    autoRenew: false,
  });

  const subscripton3 = new Subscription({
    id: '1',
    companyId: companyId3,
    planId: '12345',
    planName: 'PRO',
    planType: 'MONTHLY',
    price: 59999,
    servicesLimit: 200,
    serviceExecutionsLimit: 200,
    clientCompanysLimit: 200,
    invoicesLimit: 200,
    startDate: new Date(new Date(now).setMonth(old.getMonth() - 2)),
    endDate: new Date(new Date(now).setMonth(old.getMonth() - 1)),
  });

  beforeEach(async () => {
    repository = new InMemorySubscriptionRepository();
    const dateTransformService = dateTransformServiceMock;
    useCase = new CheckActiveSubscriptionUseCase(
      repository,
      dateTransformService,
    );
    spies = {
      checkActiveSubscriptionUseCase: {
        handle: jest.spyOn(useCase, 'handle'),
      },
      subscriptionRepository: {
        listActiveSubscriptionOfCompany: jest.spyOn(
          repository,
          'listActiveSubscriptionOfCompany',
        ),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC').mockReturnValue(now),
      },
      subscription1: {
        isActive: jest.spyOn(subscripton1, 'isActive'),
      },
      subscripton2: {
        isActive: jest.spyOn(subscripton2, 'isActive'),
      },
    };

    await repository.save(subscripton1);
    await repository.save(subscripton2);
    await repository.save(subscripton3);
  });

  it('should return true when the company has an ACTIVE subscription', async () => {
    const response = await useCase.handle({ companyId: companyId1 });

    expect(
      spies.subscriptionRepository.listActiveSubscriptionOfCompany,
    ).toHaveBeenCalledWith(companyId1);

    expect(spies.dateTransformService.nowUTC).toHaveBeenCalledWith();

    expect(spies.subscription1.isActive).toHaveBeenCalledWith(now);

    expect(response).toBe(true);
  });

  it('should return false when the company has a EXPIRED subscription', async () => {
    const response = await useCase.handle({ companyId: companyId2 });

    expect(
      spies.subscriptionRepository.listActiveSubscriptionOfCompany,
    ).toHaveBeenCalledWith(companyId2);

    expect(response).toBe(false);
  });

  it('should return false when the company has NOT an ACTIVE subscription', async () => {
    const response = await useCase.handle({ companyId: companyId3 });

    expect(
      spies.subscriptionRepository.listActiveSubscriptionOfCompany,
    ).toHaveBeenCalledWith(companyId3);

    expect(spies.dateTransformService.nowUTC).toHaveBeenCalledWith();

    expect(spies.subscription1.isActive).toHaveBeenCalledWith(now);

    expect(response).toBe(false);
  });
});
