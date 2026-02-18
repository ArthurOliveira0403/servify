import { Subscription } from '../../../domain/entities/subscription';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../../../application/services/date-transform.service';
import { Inject, Injectable } from '@nestjs/common';
import { PriceConverter } from 'src/application/common/price-converter.common';

@Injectable()
export class SubscriptionResponseMapper {
  constructor(
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
  ) {}

  handle(subscription: Subscription, tz: string) {
    return {
      id: subscription.id,
      planId: subscription.planId,
      planName: subscription.planName,
      planType: subscription.planType,
      price: PriceConverter.toResponse(subscription.price),
      status: subscription.status,
      servicesLimit: subscription.servicesLimit,
      serviceExecutionsLimit: subscription.serviceExecutionsLimit,
      clientCompanysLimit: subscription.clientCompanysLimit,
      invoicesLimit: subscription.invoicesLimit,
      startDate: this.dateTransformService.formatInTimezone(
        subscription.startDate,
        tz,
      ),
      endDate: this.dateTransformService.formatInTimezone(
        subscription.endDate,
        tz,
      ),
      renewalDate: this.dateTransformService.formatInTimezone(
        subscription.renewalDate,
        tz,
      ),
    };
  }
}
