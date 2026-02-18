import { Module } from '@nestjs/common';
import { SubscriptionController } from '../http/controllers/subscription.controller';
import { DatabaseModule } from './database.module';
import { CreateSusbcriptionUseCase } from 'src/application/use-cases/create-subscription.use-case';
import { SUBSCRIPTION_REPOSITORY } from 'src/domain/repositories/subscription.repository';
import { PrismaSubscriptionRepository } from '../services/prisma/repositories/prisma-subscription.repository';
import { AuthModule } from './auth.module';
import { PlanModule } from './plan.module';
import { DateTrasnformModule } from './date-transform.module';
import { ListActiveSubscriptionUseCase } from 'src/application/use-cases/list-active-subscription.use-case';
import { CancelSubscriptionUseCase } from 'src/application/use-cases/cancel-subscription.use-case';
import { ProcessSubscriptionsRenewalsUseCase } from 'src/application/use-cases/process-subscriptions-renewals.use-case';
import { SubscriptionCronProcessor } from '../jobs/subscription-cron-processor.job';
import { SubscriptionResponseMapper } from '../http/mappers/subscription-response.mapper';
import { SubscriptionGuard } from '../guards/subscription.guard';
import { FeatureCounterModule } from './feature-counter.module';
import { SubscriptionPolicyService } from '../services/subscription-policy/subscription-policy.service';
import { SUBSCRIPTION_POLICY_SERVICE } from 'src/application/services/isubcription-policy.service';
import { CheckActiveSubscriptionUseCase } from 'src/application/use-cases/check-active-subscription.use-case';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    PlanModule,
    DateTrasnformModule,
    FeatureCounterModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    CreateSusbcriptionUseCase,
    ListActiveSubscriptionUseCase,
    CancelSubscriptionUseCase,
    CheckActiveSubscriptionUseCase,
    ProcessSubscriptionsRenewalsUseCase,
    SubscriptionResponseMapper,
    SubscriptionCronProcessor,
    SubscriptionGuard,
    {
      provide: SUBSCRIPTION_POLICY_SERVICE,
      useClass: SubscriptionPolicyService,
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSubscriptionRepository,
    },
  ],
  exports: [
    SUBSCRIPTION_POLICY_SERVICE,
    SubscriptionGuard,
    CheckActiveSubscriptionUseCase,
  ],
})
export class SubscriptionModule {}
