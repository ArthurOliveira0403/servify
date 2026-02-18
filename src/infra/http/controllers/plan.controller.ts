import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreatePlanUseCase } from '../../../application/use-cases/create-plan.use-case';
import { UpdatePlanUseCase } from '../../../application/use-cases/update-plan.use-case';
import {
  createPlanBodySchema,
  type CreatePlanBodyDTO,
} from 'src/infra/schemas/create-plan.schemas';
import { Zod } from 'src/infra/decorators/zod.decorator';
import {
  type ListOnePlanParamDTO,
  listOnePlanParamSchema,
} from 'src/infra/schemas/list-one-plan.schemas';
import {
  type UpdatePlanBodyDTO,
  updatePlanBodySchema,
  type UpdatePlanParamDTO,
  updatePlanParamSchema,
} from 'src/infra/schemas/update-plan.schemas';
import { PlanResponseMapper } from '../mappers/plan-response.mapper';
import { ListPlansUseCase } from 'src/application/use-cases/list-plans.use-case';
import { Plan } from 'src/domain/entities/plan';
import { Roles } from 'src/infra/decorators/roles.decorator';

@Roles('ADMIN')
@Controller('plan')
export class PlanController {
  constructor(
    private createPlanUseCase: CreatePlanUseCase,
    private listPlansUseCase: ListPlansUseCase,
    private updatePlanUseCase: UpdatePlanUseCase,
  ) {}

  @Post()
  async create(@Body(Zod(createPlanBodySchema)) data: CreatePlanBodyDTO) {
    const { planId } = await this.createPlanUseCase.handle(data);
    return {
      message: 'Plan successfully created',
      planId,
    };
  }

  @Get(':id')
  async listOne(
    @Param('id', Zod(listOnePlanParamSchema)) id: ListOnePlanParamDTO,
  ) {
    const { plan } = await this.listPlansUseCase.one({ planId: id });
    return {
      plan: PlanResponseMapper.handle(plan),
    };
  }

  @Get()
  async listAll() {
    const { plans } = await this.listPlansUseCase.all();

    return {
      plans: (plans ?? []).map((p: Plan) => PlanResponseMapper.handle(p)),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', Zod(updatePlanParamSchema)) id: UpdatePlanParamDTO,
    @Body(Zod(updatePlanBodySchema)) data: UpdatePlanBodyDTO,
  ) {
    const { plan } = await this.updatePlanUseCase.handle({
      ...data,
      planId: id,
    });
    return {
      message: 'Plan successfully updated',
      plan: PlanResponseMapper.handle(plan),
    };
  }
}
