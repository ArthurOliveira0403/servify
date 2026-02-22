import { Inject, Injectable } from '@nestjs/common';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from 'src/domain/repositories/subscription.repository';
import { CancelSubscriptionDTO } from '../dtos/cancel-subscription.dto';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { NonBelongingException } from '../exceptions/non-belonging.exception';

@Injectable()
export class CancelSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private subscriptionRepository: SubscriptionRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
  ) {}

  async handle(data: CancelSubscriptionDTO): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(
      data.subscriptionId,
    );
    if (!subscription)
      throw new EntityNotFoundException(
        `The Subscripton of id: ${data.subscriptionId} not found`,
        'Subscription not found',
        CancelSubscriptionUseCase.name,
      );

    if (data.companyId !== subscription.companyId)
      throw new NonBelongingException(
        `The Subscripton of id: ${subscription.id} does not belong the company of id: ${data.companyId}`,
        'The subscription does not belong to the company',
        CancelSubscriptionUseCase.name,
      );

    subscription.cancelAtPeriodEnd(this.dateTransformService.nowUTC());

    await this.subscriptionRepository.update(subscription);
  }
}
