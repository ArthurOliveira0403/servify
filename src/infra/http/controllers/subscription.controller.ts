import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateSusbcriptionUseCase } from 'src/application/use-cases/create-subscription.use-case';
import { ListActiveSubscriptionUseCase } from 'src/application/use-cases/list-active-subscription.use-case';
import { Timezone } from 'src/infra/decorators/timezone.decorator';
import { CancelSubscriptionUseCase } from 'src/application/use-cases/cancel-subscription.use-case';
import {
  type CreateSubscriptionParamDTO,
  createSubscriptionParamSchema,
} from 'src/infra/schemas/create-subscription.schemas';
import { Zod } from 'src/infra/decorators/zod.decorator';
import {
  type CancelSubscriptionParamDTO,
  cancelSubscriptionsParamSchema,
} from 'src/infra/schemas/cancel-subscription.schemas';
import { SubscriptionResponseMapper } from '../mappers/subscription-response.mapper';
import { CurrentUser } from 'src/infra/decorators/current-user.decorator';
import { AuthUser } from 'src/domain/common/auth-user.interface';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private createSubscriptionUseCase: CreateSusbcriptionUseCase,
    private listActiveSubscriptionUseCase: ListActiveSubscriptionUseCase,
    private cancelSubscriptionUseCase: CancelSubscriptionUseCase,
    private subscriptionResponseMapper: SubscriptionResponseMapper,
  ) {}

  @Post(':planId')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('planId', Zod(createSubscriptionParamSchema))
    planId: CreateSubscriptionParamDTO,
  ) {
    const { subscriptionId } = await this.createSubscriptionUseCase.handle({
      companyId: user.id,
      planId,
    });
    return {
      message: 'Subscription succesfully created',
      subscriptionId,
    };
  }

  @Get()
  async getActive(@CurrentUser() user: AuthUser, @Timezone() tz: string) {
    const { subscription } = await this.listActiveSubscriptionUseCase.handle({
      companyId: user.id,
    });
    return {
      subscription: subscription
        ? this.subscriptionResponseMapper.handle(subscription, tz)
        : null,
    };
  }

  @Delete(':id')
  async cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', Zod(cancelSubscriptionsParamSchema))
    id: CancelSubscriptionParamDTO,
  ) {
    await this.cancelSubscriptionUseCase.handle({
      subscriptionId: id,
      companyId: user.id,
    });
    return {
      message: 'Successfully subscription canceled',
    };
  }
}
