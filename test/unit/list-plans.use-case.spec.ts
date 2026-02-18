/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ListOnePlanDTO } from 'src/application/dtos/list-plans.dto';
import { NotFoundException } from 'src/application/exceptions/not-found.exception';
import { ListPlansUseCase } from 'src/application/use-cases/list-plans.use-case';
import { Plan } from 'src/domain/entities/plan';
import { PlanRepository } from 'src/domain/repositories/plan.repository';
import { InMemoryPlanRepository } from 'test/utils/in-memory/in-memory.plan-repository';

describe('ListPlansUseCase', () => {
  let useCase: ListPlansUseCase;
  let planRepository: PlanRepository;
  let spies: any;

  const plan1 = new Plan({
    name: 'PRO',
    type: 'MONTHLY',
    price: 129.99,
    servicesLimit: 15,
    serviceExecutionsLimit: 15,
    clientCompanysLimit: 15,
    invoicesLimit: 15,
  });

  const plan2 = new Plan({
    name: 'MEDIUM',
    type: 'MONTHLY',
    price: 79.99,
    servicesLimit: 10,
    serviceExecutionsLimit: 10,
    clientCompanysLimit: 10,
    invoicesLimit: 10,
  });

  const plan3 = new Plan({
    name: 'BASIC',
    type: 'MONTHLY',
    price: 59.99,
    servicesLimit: 5,
    serviceExecutionsLimit: 5,
    clientCompanysLimit: 5,
    invoicesLimit: 5,
  });

  const dataOne: ListOnePlanDTO = {
    planId: plan1.id,
  };

  beforeEach(async () => {
    planRepository = new InMemoryPlanRepository();
    useCase = new ListPlansUseCase(planRepository);

    spies = {
      planRepository: {
        findById: jest.spyOn(planRepository, 'findById'),
        findAll: jest.spyOn(planRepository, 'findAll'),
      },
    };

    await planRepository.save(plan1);
    await planRepository.save(plan2);
    await planRepository.save(plan3);
  });

  it('should list one plan', async () => {
    const { plan } = await useCase.one(dataOne);

    expect(spies.planRepository.findById).toHaveBeenCalledWith(dataOne.planId);
    expect(plan).toBe(plan1);
  });

  it('shoul throw NotFoundException when the plan not exist', async () => {
    const fakePlanId = '123456789098765432';

    await expect(useCase.one({ planId: fakePlanId })).rejects.toThrow(
      NotFoundException,
    );

    expect(spies.planRepository.findById).toHaveBeenCalledWith(fakePlanId);
  });

  it('should list all plans', async () => {
    const { plans } = await useCase.all();

    expect(spies.planRepository.findAll).toHaveBeenCalled();
    expect(plans).toEqual([plan1, plan2, plan3]);
  });
});
