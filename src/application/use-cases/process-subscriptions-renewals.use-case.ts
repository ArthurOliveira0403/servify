import { Inject, Injectable } from '@nestjs/common';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from 'src/domain/repositories/subscription.repository';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { PlanType } from 'src/domain/entities/plan';
import { NotFoundException } from '../exceptions/not-found.exception';

@Injectable()
export class ProcessSubscriptionsRenewalsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private subscriptionRepository: SubscriptionRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
  ) {}

  async handle(): Promise<void> {
    const now = this.dateTransformService.nowUTC();

    const subscriptions = await this.subscriptionRepository.listAllActive();

    for (const subscription of subscriptions) {
      // Se for o tempo que tiver excedido, o status se torna EXPIRED. Se não, a Subscription já era expirado e não salva novamente;
      if (subscription.status === 'ACTIVE' && subscription.endDate < now) {
        subscription.expire(now);

        // Mas se o autoRenew for "true", ele é renovado. Se não, salva expirado;
        if (subscription.autoRenew) {
          subscription.renew(
            this.calculateEndDate(now, subscription.planType),
            now,
          );
        }

        await this.subscriptionRepository.update(subscription);
      }
    }
  }

  private calculateEndDate(start: Date, planType: PlanType): Date {
    switch (planType) {
      case 'MONTHLY':
        return this.dateTransformService.addMonths(start, 1);
      case 'YEARLY':
        return this.dateTransformService.addYears(start, 1);
      default:
        throw new NotFoundException(
          'The plan type is not register in useCase',
          'Invalid Plan type',
          ProcessSubscriptionsRenewalsUseCase.name,
        );
    }
  }
}
