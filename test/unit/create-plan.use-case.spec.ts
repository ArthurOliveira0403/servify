/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PriceConverter } from 'src/application/common/price-converter.common';
import { CreatePlanDTO } from 'src/application/dtos/create-plan.dto';
import { ConflictException } from 'src/application/exceptions/conflict.exception';
import { CreatePlanUseCase } from 'src/application/use-cases/create-plan.use-case';
import { Plan } from 'src/domain/entities/plan';
import { PlanRepository } from 'src/domain/repositories/plan.repository';
import { InMemoryPlanRepository } from 'test/utils/in-memory/in-memory.plan-repository';
import { dateTransformMock } from 'test/utils/mocks/date-transform.mock';

describe('CreatePlanUseCase', () => {
  let useCase: CreatePlanUseCase;
  let planRepository: PlanRepository;
  let spies: any;

  const data: CreatePlanDTO = {
    name: 'PRO',
    type: 'MONTHLY',
    price: 129.99,
    servicesLimit: 15,
    serviceExecutionsLimit: 15,
    clientCompanysLimit: 15,
    invoicesLimit: 15,
  };

  beforeEach(() => {
    planRepository = new InMemoryPlanRepository();
    const dateTransformService = dateTransformMock;
    useCase = new CreatePlanUseCase(planRepository, dateTransformService);

    spies = {
      planRepository: {
        save: jest.spyOn(planRepository, 'save'),
        findByName: jest.spyOn(planRepository, 'findByName'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC'),
      },
      priceConverter: {
        toRepository: jest.spyOn(PriceConverter, 'toRepository'),
      },
    };
  });

  it('should create a plan', async () => {
    const { planId } = await useCase.handle(data);

    expect(spies.planRepository.findByName).toHaveBeenCalledWith(data.name);
    expect(spies.priceConverter.toRepository).toHaveBeenCalledWith(data.price);
    expect(spies.planRepository.save).toHaveBeenCalledWith(expect.any(Plan));

    const plan = (await planRepository.findAll())[0];

    expect(planId).toBe(plan.id);
    expect(plan.name).toBe(data.name);
    expect(plan.type).toBe(data.type);
    expect(plan.price).toBe(PriceConverter.toRepository(data.price));
    expect(plan.servicesLimit).toBe(data.servicesLimit);
    expect(plan.serviceExecutionsLimit).toBe(data.serviceExecutionsLimit);
    expect(plan.clientCompanysLimit).toBe(data.clientCompanysLimit);
    expect(plan.invoicesLimit).toBe(data.invoicesLimit);
  });

  it('should throw ConflictException when already exists a plan with the name', async () => {
    await useCase.handle(data);

    await expect(
      useCase.handle({ ...data, price: 299.99, type: 'YEARLY' }),
    ).rejects.toThrow(ConflictException);

    expect(spies.planRepository.findByName).toHaveBeenCalledWith(data.name);
  });
});
