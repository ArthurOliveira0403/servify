/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from 'src/application/exceptions/conflict.exception';
import { NotFoundException } from 'src/application/exceptions/not-found.exception';
import { CreatePlanUseCase } from 'src/application/use-cases/create-plan.use-case';
import { ListPlansUseCase } from 'src/application/use-cases/list-plans.use-case';
import { UpdatePlanUseCase } from 'src/application/use-cases/update-plan.use-case';
import { Plan } from 'src/domain/entities/plan';
import { PlanController } from 'src/infra/http/controllers/plan.controller';
import { PlanResponseMapper } from 'src/infra/http/mappers/plan-response.mapper';
import { CreatePlanBodyDTO } from 'src/infra/schemas/create-plan.schemas';
import { UpdatePlanBodyDTO } from 'src/infra/schemas/update-plan.schemas';

const createPlanUseCaseMock = {
  provide: CreatePlanUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const listPlansUseCaseMock = {
  provide: ListPlansUseCase,
  useValue: {
    all: jest.fn(),
    one: jest.fn(),
  },
};

const updatePlanUseCaseMock = {
  provide: UpdatePlanUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

describe('PlanController', () => {
  let controller: PlanController;
  let spies: any;

  const planId = '1234';

  const dataCreate: CreatePlanBodyDTO = {
    name: 'PRO',
    type: 'MONTHLY',
    price: 129.99,
    servicesLimit: 15,
    serviceExecutionsLimit: 15,
    clientCompanysLimit: 15,
    invoicesLimit: 15,
  };

  const dataUpdate: UpdatePlanBodyDTO = {
    name: 'PREMIUM',
    price: 399.99,
  };

  const plan = new Plan({
    id: planId,
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

  const plan2 = new Plan({
    id: '1',
    name: 'MEDIUM',
    type: 'MONTHLY',
    price: 89.99,
    servicesLimit: 10,
    serviceExecutionsLimit: 10,
    clientCompanysLimit: 10,
    invoicesLimit: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const plan3 = new Plan({
    id: '3',
    name: 'BASIC',
    type: 'YEARLY',
    price: 1599.99,
    servicesLimit: 5,
    serviceExecutionsLimit: 5,
    clientCompanysLimit: 5,
    invoicesLimit: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [
        createPlanUseCaseMock,
        listPlansUseCaseMock,
        updatePlanUseCaseMock,
      ],
    }).compile();

    controller = moduleRef.get(PlanController);

    const createPlanUseCase = moduleRef.get(CreatePlanUseCase);
    const listPlansUseCase = moduleRef.get(ListPlansUseCase);
    const updatePlanUseCase = moduleRef.get(UpdatePlanUseCase);

    spies = {
      createPlanUseCase: {
        handle: jest.spyOn(createPlanUseCase, 'handle'),
      },
      listPlansUseCase: {
        all: jest.spyOn(listPlansUseCase, 'all'),
        one: jest.spyOn(listPlansUseCase, 'one'),
      },
      updatePlanUseCase: {
        handle: jest.spyOn(updatePlanUseCase, 'handle'),
      },
      planResponseMapper: {
        handle: jest.spyOn(PlanResponseMapper, 'handle'),
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== Create method ====================
  it('should create a plan', async () => {
    spies.createPlanUseCase.handle.mockResolvedValue({ planId });

    const response = await controller.create(dataCreate);

    expect(spies.createPlanUseCase.handle).toHaveBeenCalledWith(dataCreate);
    expect(response.message).toBe('Plan successfully created');
    expect(response.planId).toBe(planId);
  });

  it('should throw a ConflictException when already exists a plan with the name', async () => {
    spies.createPlanUseCase.handle.mockRejectedValue(
      new ConflictException('', '', ''),
    );

    await expect(controller.create(dataCreate)).rejects.toThrow(
      ConflictException,
    );

    expect(spies.createPlanUseCase.handle).toHaveBeenCalledWith(dataCreate);
  });

  // ==================== ListOne method ====================
  it('should list one plan', async () => {
    spies.listPlansUseCase.one.mockResolvedValue({ plan });
    spies.planResponseMapper.handle.mockReturnValue(plan);

    const response = await controller.listOne(planId);

    expect(spies.listPlansUseCase.one).toHaveBeenCalledWith({ planId });
    expect(spies.planResponseMapper.handle).toHaveBeenCalledWith(plan);
    expect(response.plan).toBe(plan);
  });

  it('should throw a NotFoundExpection when the plan no exist', async () => {
    const fakePlanId = 'fakeId';

    spies.listPlansUseCase.one.mockRejectedValue(
      new NotFoundException('', '', ''),
    );

    await expect(controller.listOne(fakePlanId)).rejects.toThrow(
      NotFoundException,
    );
  });

  // ==================== ListAll method ====================
  it('should list all plans', async () => {
    const plans = [plan, plan2, plan3];

    spies.listPlansUseCase.all.mockResolvedValue({
      plans,
    });

    spies.planResponseMapper.handle.mockImplementation((plan: Plan) => plan);

    const response = await controller.listAll();

    expect(spies.listPlansUseCase.all).toHaveBeenCalled();
    expect(spies.planResponseMapper.handle).toHaveBeenCalled();
    expect(response.plans).toEqual([plan, plan2, plan3]);
  });

  it('should return [] when not have plans', async () => {
    spies.listPlansUseCase.all.mockResolvedValue([]);

    const response = await controller.listAll();

    expect(spies.listPlansUseCase.all).toHaveBeenCalled();
    expect(spies.planResponseMapper.handle).not.toHaveBeenCalled();
    expect(response.plans).toEqual([]);
  });

  // ==================== Update method ====================
  it('should update a plan', async () => {
    const planUpdated = new Plan({
      id: planId,
      name: 'PREMIUM',
      type: 'MONTHLY',
      price: 399.99,
      servicesLimit: 15,
      serviceExecutionsLimit: 15,
      clientCompanysLimit: 15,
      invoicesLimit: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    spies.updatePlanUseCase.handle.mockResolvedValue({ plan: planUpdated });
    spies.planResponseMapper.handle.mockReturnValue(planUpdated);

    const response = await controller.update(planId, dataUpdate);

    expect(spies.updatePlanUseCase.handle).toHaveBeenCalledWith({
      ...dataUpdate,
      planId,
    });
    expect(spies.planResponseMapper.handle).toHaveBeenCalled();
    expect(response.message).toBe('Plan successfully updated');
    expect(response.plan).toEqual(planUpdated);
  });

  it('should throw a NotFoundException when the plan not exist', async () => {
    spies.updatePlanUseCase.handle.mockRejectedValue(
      new NotFoundException('', '', ''),
    );

    await expect(controller.update(planId, dataUpdate)).rejects.toThrow(
      NotFoundException,
    );

    expect(spies.updatePlanUseCase.handle).toHaveBeenCalledWith({
      ...dataUpdate,
      planId,
    });
  });
});
