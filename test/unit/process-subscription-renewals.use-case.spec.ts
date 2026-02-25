/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ProcessSubscriptionsRenewalsUseCase } from 'src/application/use-cases/process-subscriptions-renewals.use-case';
import { Subscription } from 'src/domain/entities/subscription';
import { SubscriptionRepository } from 'src/domain/repositories/subscription.repository';
import { InMemorySubscriptionRepository } from 'test/utils/in-memory/in-memory.subscription-repository';
import { dateTransformServiceMock } from 'test/utils/mocks/date-transform-service.mock';

describe('ProcessSubscriptionRenewalsUseCae', () => {
  let useCase: ProcessSubscriptionsRenewalsUseCase;
  let subscriptionRepository: SubscriptionRepository;
  let spies: any;

  const startMonthlyDate = new Date('2025-11-01T10:30:00Z');
  const endMonthlyDate = new Date('2025-12-31T10:30:00Z');

  const startYearlyDate = new Date('2025-06-01T00:00:00Z');
  const endYearlyDate = new Date('2026-06-01T00:00:00Z');

  const now = new Date('2026-01-01T00:00:00Z');

  // Não vai passar por alteração
  const subscription1 = new Subscription({
    id: '1',
    companyId: '1',
    planId: '1',
    planName: 'BASIC',
    planType: 'YEARLY',
    price: 299999,
    status: 'ACTIVE',
    servicesLimit: 10,
    serviceExecutionsLimit: 10,
    clientCompanysLimit: 10,
    invoicesLimit: 10,
    startDate: startYearlyDate,
    endDate: endYearlyDate,
    autoRenew: true,
  });

  // Vai expirar e ser renovada
  const subscription2 = new Subscription({
    id: '2',
    companyId: '2',
    planId: '2',
    planName: 'MEDIUM',
    planType: 'MONTHLY',
    price: 14999,
    status: 'ACTIVE',
    servicesLimit: 25,
    serviceExecutionsLimit: 25,
    clientCompanysLimit: 25,
    invoicesLimit: 25,
    startDate: startMonthlyDate,
    endDate: endMonthlyDate,
    autoRenew: true,
  });

  // Já está salva expirada, portanto, não irá nem ser passada pelo repository;
  const subscription3 = new Subscription({
    id: '3',
    companyId: '3',
    planId: '3',
    planName: 'PRO',
    planType: 'MONTHLY',
    price: 24999,
    status: 'EXPIRED',
    servicesLimit: 50,
    serviceExecutionsLimit: 50,
    clientCompanysLimit: 50,
    invoicesLimit: 50,
    startDate: startMonthlyDate,
    endDate: endMonthlyDate,
    autoRenew: false,
  });

  beforeEach(async () => {
    subscriptionRepository = new InMemorySubscriptionRepository();
    const dateTransformService = dateTransformServiceMock;
    useCase = new ProcessSubscriptionsRenewalsUseCase(
      subscriptionRepository,
      dateTransformService,
    );

    spies = {
      subscriptionRepository: {
        listAllActive: jest.spyOn(subscriptionRepository, 'listAllActive'),
        update: jest.spyOn(subscriptionRepository, 'update'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC').mockReturnValue(now),
        addMonths: jest.spyOn(dateTransformService, 'addMonths'),
        addYears: jest.spyOn(dateTransformService, 'addYears'),
      },
      subscription1: {
        expire: jest.spyOn(subscription1, 'expire'),
        renew: jest.spyOn(subscription1, 'renew'),
      },
      subscription2: {
        expire: jest.spyOn(subscription2, 'expire'),
        renew: jest.spyOn(subscription2, 'renew'),
      },
      subscription3: {
        expire: jest.spyOn(subscription3, 'expire'),
        renew: jest.spyOn(subscription3, 'renew'),
      },
    };

    await subscriptionRepository.save(subscription1);
    await subscriptionRepository.save(subscription2);
    await subscriptionRepository.save(subscription3);
  });

  it('should renew only the subscription2', async () => {
    await useCase.handle();

    const sub1 = await subscriptionRepository.findById(subscription1.id);
    const sub2 = await subscriptionRepository.findById(subscription2.id);

    expect(sub1!.status).toBe('ACTIVE');
    expect(sub1!.startDate).toBe(startYearlyDate);
    expect(sub1!.endDate).toBe(endYearlyDate);

    expect(sub2!.status).toBe('ACTIVE');
    expect(sub2!.startDate).toBe(now);
    expect(sub2!.endDate).toEqual(dateTransformServiceMock.addMonths(now, 1));

    expect(spies.subscriptionRepository.listAllActive).toHaveBeenCalled();
  });
});
