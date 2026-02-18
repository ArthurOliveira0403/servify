import { Inject, Injectable } from '@nestjs/common';
import { Subscription } from 'src/domain/entities/subscription';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/repositories/subscription.repository';
import type { SubscriptionRepository } from 'src/domain/repositories/subscription.repository';
import { ListActiveSubscriptionDTO } from '../dtos/list-active-subscription.dto';

@Injectable()
export class ListActiveSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private subscriptionRepository: SubscriptionRepository,
  ) {}

  async handle(
    data: ListActiveSubscriptionDTO,
  ): Promise<{ subscription: Subscription | null }> {
    const subscription =
      await this.subscriptionRepository.listActiveSubscriptionOfCompany(
        data.companyId,
      );

    return { subscription: subscription ?? null };
  }
}
