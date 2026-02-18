import { Subscription } from '../entities/subscription';

export const SUBSCRIPTION_REPOSITORY = 'SUBSCRIPTION_REPOSITORY';

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
  findById(id: string): Promise<Subscription | null>;
  listActiveSubscriptionOfCompany(
    companyId: string,
  ): Promise<Subscription | null>;
  listAllActive(): Promise<Subscription[] | []>;
  update(subscription: Subscription): Promise<void>;
}
