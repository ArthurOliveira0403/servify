/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PriceConverter } from 'src/application/common/price-converter.common';
import { UpdatePlanDTO } from 'src/application/dtos/update-plan.dto';
import { NotFoundException } from 'src/application/exceptions/not-found.exception';
import { UpdatePlanUseCase } from 'src/application/use-cases/update-plan.use-case';
import { Plan } from 'src/domain/entities/plan';
import { PlanRepository } from 'src/domain/repositories/plan.repository';
import { InMemoryPlanRepository } from 'test/utils/in-memory/in-memory.plan-repository';
import { dateTransformMock } from 'test/utils/mocks/date-transform.mock';

describe('UpdatePlanUseCase', () => {
  let useCase: UpdatePlanUseCase;
  let planRepository: PlanRepository;
  let spies: any;

  const plan = new Plan({
    name: 'PRO',
    type: 'MONTHLY',
    price: 129.99,
    servicesLimit: 15,
    serviceExecutionsLimit: 15,
    clientCompanysLimit: 15,
    invoicesLimit: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const now = new Date('2026-01-01T00:00:00Z');

  const data: UpdatePlanDTO = {
    planId: plan.id,
    name: 'PREMIUM',
    price: 399.99,
  };

  beforeEach(async () => {
    planRepository = new InMemoryPlanRepository();
    const dateTransformService = dateTransformMock;
    useCase = new UpdatePlanUseCase(planRepository, dateTransformService);

    spies = {
      planRepository: {
        findById: jest.spyOn(planRepository, 'findById'),
        update: jest.spyOn(planRepository, 'update'),
      },
      plan: {
        update: jest.spyOn(plan, 'update'),
      },
      priceConverter: {
        toRepository: jest.spyOn(PriceConverter, 'toRepository'),
      },
      dateTransform: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC').mockReturnValue(now),
      },
    };

    await planRepository.save(plan);
  });

  it('should update a plan', async () => {
    const { plan } = await useCase.handle(data);

    expect(spies.planRepository.findById).toHaveBeenCalledWith(data.planId);
    expect(spies.plan.update).toHaveBeenCalledWith({
      ...data,
      price: PriceConverter.toRepository(data.price!),
      now,
    });
    expect(spies.planRepository.update).toHaveBeenCalledWith(expect.any(Plan));

    expect(plan.name).toBe(data.name);
    expect(plan.price).toBe(PriceConverter.toRepository(data.price!));
  });

  it('should throw a NotFoundException when the plan not exist', async () => {
    const fakePlanId = '123456789';

    await expect(
      useCase.handle({ ...data, planId: fakePlanId }),
    ).rejects.toThrow(NotFoundException);

    expect(spies.planRepository.findById).toHaveBeenCalledWith(fakePlanId);
  });
});
