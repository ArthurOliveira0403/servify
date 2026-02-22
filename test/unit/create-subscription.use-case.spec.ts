/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Subscription } from 'src/domain/entities/subscription';
import { CreateSubscriptionDTO } from 'src/application/dtos/create-subscription.dto';
import { CreateSusbcriptionUseCase } from 'src/application/use-cases/create-subscription.use-case';
import { Plan } from 'src/domain/entities/plan';
import { PlanRepository } from 'src/domain/repositories/plan.repository';
import { SubscriptionRepository } from 'src/domain/repositories/subscription.repository';
import { InMemoryPlanRepository } from 'test/utils/in-memory/in-memory.plan-repository';
import { InMemorySubscriptionRepository } from 'test/utils/in-memory/in-memory.subscription-repository';
import { dateTransformMock } from 'test/utils/mocks/date-transform.mock';
import { AlreadyExistException } from 'src/application/exceptions/already-exist.exception';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';

describe('CreateSubscriptionUseCase', () => {
  let useCase: CreateSusbcriptionUseCase;
  let subscriptionRepository: SubscriptionRepository;
  let planRepository: PlanRepository;
  let spies: any;

  const companyId = '1234';
  const now = new Date('2026-01-01T00:00:00Z');

  const monthlyPlan = new Plan({
    id: '1',
    name: 'BASIC',
    type: 'MONTHLY',
    price: 19999,
    servicesLimit: 12,
    serviceExecutionsLimit: 12,
    clientCompanysLimit: 12,
    invoicesLimit: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const monthlyData: CreateSubscriptionDTO = {
    companyId,
    planId: monthlyPlan.id,
  };

  const yearlyPlan = new Plan({
    id: '2',
    name: 'PRO',
    type: 'YEARLY',
    price: 29999,
    servicesLimit: 15,
    serviceExecutionsLimit: 15,
    clientCompanysLimit: 15,
    invoicesLimit: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const yearlyData: CreateSubscriptionDTO = {
    companyId,
    planId: yearlyPlan.id,
  };

  beforeEach(async () => {
    subscriptionRepository = new InMemorySubscriptionRepository();
    planRepository = new InMemoryPlanRepository();
    const dateTransformService = dateTransformMock;
    useCase = new CreateSusbcriptionUseCase(
      subscriptionRepository,
      planRepository,
      dateTransformService,
    );

    spies = {
      subscriptionRepository: {
        listActiveSubscriptionOfCompany: jest.spyOn(
          subscriptionRepository,
          'listActiveSubscriptionOfCompany',
        ),
        save: jest.spyOn(subscriptionRepository, 'save'),
      },
      planRepository: {
        findById: jest.spyOn(planRepository, 'findById'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC').mockReturnValue(now),
        addMonths: jest.spyOn(dateTransformService, 'addMonths'),
        addYears: jest.spyOn(dateTransformService, 'addYears'),
      },
    };

    await planRepository.save(monthlyPlan);
    await planRepository.save(yearlyPlan);
  });

  it('should create a new monthly Subscription', async () => {
    const { subscriptionId } = await useCase.handle(monthlyData);

    expect(
      spies.subscriptionRepository.listActiveSubscriptionOfCompany,
    ).toHaveBeenCalledWith(monthlyData.companyId);
    expect(spies.planRepository.findById).toHaveBeenCalledWith(
      monthlyData.planId,
    );
    expect(spies.subscriptionRepository.save).toHaveBeenCalledWith(
      expect.any(Subscription),
    );

    const subscription = (await subscriptionRepository.listAllActive())[0];

    expect(subscription.id).toBe(subscriptionId);
    expect(subscription.companyId).toBe(monthlyData.companyId);
    expect(subscription.planType).toBe(monthlyPlan.type);
    expect(subscription.planName).toBe(monthlyPlan.name);
    expect(subscription.price).toBe(monthlyPlan.price);
    expect(subscription.servicesLimit).toBe(monthlyPlan.servicesLimit);
    expect(subscription.serviceExecutionsLimit).toBe(
      monthlyPlan.serviceExecutionsLimit,
    );
    expect(subscription.clientCompanysLimit).toBe(
      monthlyPlan.clientCompanysLimit,
    );
    expect(subscription.invoicesLimit).toBe(monthlyPlan.invoicesLimit);
    expect(subscription.status).toBe('ACTIVE');
    expect(subscription.startDate).toBe(now);
    expect(subscription.endDate).toEqual(dateTransformMock.addMonths(now, 1));
    expect(subscription.renewalDate).toEqual(
      dateTransformMock.addMonths(now, 1),
    );
    expect(subscription.autoRenew).toBe(true);
  });

  it('should create a new yearly Subscription', async () => {
    const { subscriptionId } = await useCase.handle(yearlyData);

    expect(
      spies.subscriptionRepository.listActiveSubscriptionOfCompany,
    ).toHaveBeenCalledWith(yearlyData.companyId);
    expect(spies.planRepository.findById).toHaveBeenCalledWith(
      yearlyData.planId,
    );
    expect(spies.subscriptionRepository.save).toHaveBeenCalledWith(
      expect.any(Subscription),
    );

    const subscription = (await subscriptionRepository.listAllActive())[0];

    expect(subscription.id).toBe(subscriptionId);
    expect(subscription.companyId).toBe(yearlyData.companyId);
    expect(subscription.planType).toBe(yearlyPlan.type);
    expect(subscription.planName).toBe(yearlyPlan.name);
    expect(subscription.price).toBe(yearlyPlan.price);
    expect(subscription.servicesLimit).toBe(yearlyPlan.servicesLimit);
    expect(subscription.serviceExecutionsLimit).toBe(
      yearlyPlan.serviceExecutionsLimit,
    );
    expect(subscription.clientCompanysLimit).toBe(
      yearlyPlan.clientCompanysLimit,
    );
    expect(subscription.invoicesLimit).toBe(yearlyPlan.invoicesLimit);
    expect(subscription.status).toBe('ACTIVE');
    expect(subscription.startDate).toBe(now);
    expect(subscription.endDate).toEqual(dateTransformMock.addYears(now, 1));
    expect(subscription.renewalDate).toEqual(
      dateTransformMock.addYears(now, 1),
    );
    expect(subscription.autoRenew).toBe(true);
  });

  it('should throw a AlreadyExistException when already exists a active subscription', async () => {
    await useCase.handle(monthlyData);

    await expect(useCase.handle(yearlyData)).rejects.toThrow(
      AlreadyExistException,
    );

    expect(
      spies.subscriptionRepository.listActiveSubscriptionOfCompany,
    ).toHaveBeenCalledWith(yearlyData.companyId);
  });

  it('should throw a EntityNotFoundException when the plan not exists', async () => {
    const fakePlanId = '1234567890';

    await expect(
      useCase.handle({ companyId: monthlyData.companyId, planId: fakePlanId }),
    ).rejects.toThrow(EntityNotFoundException);

    expect(
      spies.subscriptionRepository.listActiveSubscriptionOfCompany,
    ).toHaveBeenCalledWith(monthlyData.companyId);
    expect(spies.planRepository.findById).toHaveBeenCalledWith(fakePlanId);
  });
});
