/* eslint-disable @typescript-eslint/await-thenable */
import { Subscription } from 'src/domain/entities/subscription';
import { SubscriptionRepository } from 'src/domain/repositories/subscription.repository';

export class InMemorySubscriptionRepository implements SubscriptionRepository {
  subscriptions: Subscription[] = [];

  async save(subscription: Subscription): Promise<void> {
    await this.subscriptions.push(subscription);
  }

  async findById(id: string): Promise<Subscription | null> {
    const subscription = await this.subscriptions.find((s) => s.id === id);

    return subscription ?? null;
  }

  async listActiveSubscriptionOfCompany(
    companyId: string,
  ): Promise<Subscription | null> {
    const subscription = await this.subscriptions.find(
      (s) => s.status === 'ACTIVE' && s.companyId === companyId,
    );

    return subscription ?? null;
  }

  async listAllActive(): Promise<Subscription[] | []> {
    const subscriptions = await this.subscriptions.filter(
      (s) => s.status === 'ACTIVE',
    );

    return subscriptions ?? [];
  }

  async update(subscription: Subscription): Promise<void> {
    const index = await this.subscriptions.findIndex(
      (s) => s.id === subscription.id,
    );
    if (index === -1) throw new Error('Subscription not found');

    this.subscriptions[index] = subscription;
  }
}
