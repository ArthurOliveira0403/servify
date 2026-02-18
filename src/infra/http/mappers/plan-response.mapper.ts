import { Plan } from '../../../domain/entities/plan';
import { PriceConverter } from 'src/application/common/price-converter.common';

export class PlanResponseMapper {
  static handle(plan: Plan) {
    return {
      id: plan.id,
      name: plan.name,
      type: plan.type,
      price: PriceConverter.toResponse(plan.price),
      servicesLimit: plan.servicesLimit,
      serviceExecutionsLimit: plan.serviceExecutionsLimit,
      clientCompanysLimit: plan.clientCompanysLimit,
      invoicesLimit: plan.invoicesLimit,
    };
  }
}
