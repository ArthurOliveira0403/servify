import { Inject, Injectable } from '@nestjs/common';
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from 'src/domain/repositories/subscription.repository';
import { Feature, Subscription } from 'src/domain/entities/subscription';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from 'src/application/services/date-transform.service';
import {
  FEATURE_COUNTER_SERVICE,
  type IFeatureCounterService,
} from 'src/application/services/ifeature-counter.service';
import { ISubscriptionPolicyService } from 'src/application/services/isubcription-policy.service';
import { NonActiveSubscriptionException } from 'src/infra/exceptions/non-active-subscription.exception';

@Injectable()
export class SubscriptionPolicyService implements ISubscriptionPolicyService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private subscriptionRepository: SubscriptionRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
    @Inject(FEATURE_COUNTER_SERVICE)
    private featureCounterService: IFeatureCounterService,
  ) {}

  async handle(companyId: string, feature: Feature): Promise<void> {
    const now = this.dateTransformService.nowUTC();
    const { subscription } = await this.verifySubscription(companyId);
    const currentCount = await this.featureCounterService.handle(
      feature,
      companyId,
    );

    subscription.assertCanUseFeature(feature, currentCount, now);
  }

  private async verifySubscription(
    companyId: string,
  ): Promise<{ subscription: Subscription }> {
    const subscription =
      await this.subscriptionRepository.listActiveSubscriptionOfCompany(
        companyId,
      );

    if (!subscription)
      throw new NonActiveSubscriptionException(
        `No active subscription of ${companyId} company`,
        SubscriptionPolicyService.name,
      );

    return { subscription };
  }
}
