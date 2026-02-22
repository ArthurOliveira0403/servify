import type { SubscriptionRepository } from 'src/domain/repositories/subscription.repository';
import { PrismaService } from '../prisma.service';
import { Subscription } from 'src/domain/entities/subscription';
import { PrismaSubscriptionMapper } from '../mappers/prisma-subscription.mapper';
import { Injectable } from '@nestjs/common';
import { PrismaWrapper } from '../wrapper/prisma.wrapper';

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private prisma: PrismaService) {}

  async save(subscription: Subscription): Promise<void> {
    return PrismaWrapper.handle(async () => {
      const row = PrismaSubscriptionMapper.toPrisma(subscription);

      await this.prisma.subscription.create({ data: { ...row } });
    });
  }

  async findById(id: string): Promise<Subscription | null> {
    return await PrismaWrapper.handle(async () => {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
      });

      return subscription
        ? PrismaSubscriptionMapper.toDomain(subscription)
        : null;
    });
  }
  async listActiveSubscriptionOfCompany(
    companyId: string,
  ): Promise<Subscription | null> {
    return await PrismaWrapper.handle(async () => {
      const subscriptionExist = await this.prisma.subscription.findFirst({
        where: {
          company_id: companyId,
          status: 'ACTIVE',
        },
      });

      if (!subscriptionExist) return null;

      return PrismaSubscriptionMapper.toDomain(subscriptionExist);
    });
  }

  async listAllActive(): Promise<Subscription[] | []> {
    return await PrismaWrapper.handle(async () => {
      const subscriptions = await this.prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
      });

      return subscriptions
        ? subscriptions.map((s) => PrismaSubscriptionMapper.toDomain(s))
        : [];
    });
  }

  async update(subscription: Subscription): Promise<void> {
    return await PrismaWrapper.handle(async () => {
      const raw = PrismaSubscriptionMapper.toPrisma(subscription);

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: raw,
      });
    });
  }
}
