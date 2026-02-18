import { Inject, Injectable } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/repositories/subscription.repository';
import type { SubscriptionRepository } from 'src/domain/repositories/subscription.repository';
import { CreateSubscriptionDTO } from '../dtos/create-subscription.dto';
import { Subscription } from 'src/domain/entities/subscription';
import { PLAN_REPOSITORY } from 'src/domain/repositories/plan.repository';
import type { PlanRepository } from 'src/domain/repositories/plan.repository';
import { PlanType } from 'src/domain/entities/plan';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { ConflictException } from '../exceptions/conflict.exception';
import { NotFoundException } from '../exceptions/not-found.exception';

@Injectable()
export class CreateSusbcriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private subscriptionRepository: SubscriptionRepository,
    @Inject(PLAN_REPOSITORY)
    private planRepository: PlanRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTrasnformService: DateTransformService,
  ) {}

  async handle(
    data: CreateSubscriptionDTO,
  ): Promise<{ subscriptionId: string }> {
    const subscriptionExist =
      await this.subscriptionRepository.listActiveSubscriptionOfCompany(
        data.companyId,
      );
    if (subscriptionExist)
      throw new ConflictException(
        'There is already an active subscription',
        'There is already an active subscription',
        CreateSusbcriptionUseCase.name,
      );

    const plan = await this.planRepository.findById(data.planId);
    if (!plan)
      throw new NotFoundException(
        'Plan not found',
        'This Plan was not found',
        CreateSusbcriptionUseCase.name,
      );

    const now = this.dateTrasnformService.nowUTC();

    const endDate = this.calculateEndDate(now, plan.type);

    const subscription = new Subscription({
      companyId: data.companyId,
      planId: data.planId,
      planName: plan.name,
      planType: plan.type,
      price: plan.price,
      servicesLimit: plan.servicesLimit,
      serviceExecutionsLimit: plan.serviceExecutionsLimit,
      clientCompanysLimit: plan.clientCompanysLimit,
      invoicesLimit: plan.invoicesLimit,
      startDate: now,
      endDate: endDate,
      createdAt: now,
      updatedAt: now,
    });

    await this.subscriptionRepository.save(subscription);

    const subscriptionId = subscription.id;

    return { subscriptionId };
  }

  private calculateEndDate(start: Date, type: PlanType): Date {
    switch (type) {
      case 'MONTHLY':
        return this.dateTrasnformService.addMonths(start, 1);
      case 'YEARLY':
        return this.dateTrasnformService.addYears(start, 1);
      default:
        throw new NotFoundException(
          'The plan type is not register in useCase',
          'Invalid Plan type',
          CreateSusbcriptionUseCase.name,
        );
    }
  }
}
