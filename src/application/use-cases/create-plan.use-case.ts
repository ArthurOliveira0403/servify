import { Inject, Injectable } from '@nestjs/common';
import { CreatePlanDTO } from '../dtos/create-plan.dto';
import {
  PLAN_REPOSITORY,
  type PlanRepository,
} from 'src/domain/repositories/plan.repository';
import { Plan } from '../../domain/entities/plan';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { PriceConverter } from '../common/price-converter.common';
import { AlreadyExistException } from '../exceptions/already-exist.exception';

@Injectable()
export class CreatePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private planRepository: PlanRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
  ) {}

  async handle(data: CreatePlanDTO): Promise<{ planId: string }> {
    const existPlan = await this.planRepository.findByName(data.name);

    if (existPlan)
      throw new AlreadyExistException(
        `The Plan with "${data.name}" name already exist`,
        'Plan already exist',
        CreatePlanUseCase.name,
      );

    const price = PriceConverter.toRepository(data.price);

    const plan = new Plan({
      ...data,
      price,
      createdAt: this.dateTransformService.nowUTC(),
      updatedAt: this.dateTransformService.nowUTC(),
    });

    await this.planRepository.save(plan);

    const planId = plan.id;

    return { planId };
  }
}
