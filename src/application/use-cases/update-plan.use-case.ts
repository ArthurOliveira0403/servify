import { Inject } from '@nestjs/common';
import { PLAN_REPOSITORY } from 'src/domain/repositories/plan.repository';
import type { PlanRepository } from 'src/domain/repositories/plan.repository';
import { UpdatePlanDTO } from '../dtos/update-plan.dto';
import { Plan } from '../../domain/entities/plan';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { PriceConverter } from '../common/price-converter.common';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';

export class UpdatePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private planRepository: PlanRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
  ) {}

  async handle(data: UpdatePlanDTO): Promise<{ plan: Plan }> {
    const planExist = await this.planRepository.findById(data.planId);
    if (!planExist)
      throw new EntityNotFoundException(
        `The Plan of id: ${data.planId} not found`,
        'Plan not found',
        UpdatePlanUseCase.name,
      );

    planExist.update({
      ...data,
      price: data.price ? PriceConverter.toRepository(data.price) : undefined,
      now: this.dateTransformService.nowUTC(),
    });

    await this.planRepository.update(planExist);

    const plan = await this.planRepository.findById(data.planId);

    return { plan: plan! };
  }
}
