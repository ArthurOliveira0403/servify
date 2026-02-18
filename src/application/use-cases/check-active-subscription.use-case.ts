import { Inject, Injectable } from '@nestjs/common';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from 'src/domain/repositories/subscription.repository';
import { CheckActiveSubscriptionDTO } from '../dtos/check-active-subscription.dto';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';

@Injectable()
export class CheckActiveSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private subscriptionRepository: SubscriptionRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
  ) {}

  async handle(data: CheckActiveSubscriptionDTO): Promise<boolean> {
    const subscription =
      await this.subscriptionRepository.listActiveSubscriptionOfCompany(
        data.companyId,
      );

    if (
      !subscription ||
      !subscription.isActive(this.dateTransformService.nowUTC())
    )
      return false;

    return true;
  }
}
