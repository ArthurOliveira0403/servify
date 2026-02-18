import { Inject, Injectable } from '@nestjs/common';
import {
  PLAN_REPOSITORY,
  type PlanRepository,
} from 'src/domain/repositories/plan.repository';
import { ListOnePlanDTO } from '../dtos/list-plans.dto';
import { Plan } from 'src/domain/entities/plan';
import { NotFoundException } from '../exceptions/not-found.exception';

@Injectable()
export class ListPlansUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private planRepository: PlanRepository,
  ) {}

  async one(data: ListOnePlanDTO): Promise<{ plan: Plan }> {
    const plan = await this.planRepository.findById(data.planId);

    if (!plan)
      throw new NotFoundException(
        `Plan ${data.planId} not found`,
        'Plan not found',
        ListPlansUseCase.name,
      );

    return { plan };
  }

  async all(): Promise<{ plans: Plan[] | [] }> {
    const plans = await this.planRepository.findAll();

    return { plans };
  }
}
