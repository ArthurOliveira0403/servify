import { Plan as PrismaPlan } from '@prisma/client';
import { Plan as DomainPlan } from 'src/domain/entities/plan';

export class PrismaPlanMapper {
  static toPrisma(plan: DomainPlan) {
    return {
      id: plan.id,
      name: plan.name,
      type: plan.type,
      price: plan.price,
      services_limit: plan.servicesLimit,
      service_executions_limit: plan.serviceExecutionsLimit,
      client_companys_limit: plan.clientCompanysLimit,
      invoices_limit: plan.invoicesLimit,
      created_at: plan.createdAt,
      updated_at: plan.updatedAt,
    };
  }

  static toDomain(plan: PrismaPlan) {
    return new DomainPlan({
      ...plan,
      servicesLimit: plan.services_limit,
      serviceExecutionsLimit: plan.service_executions_limit,
      clientCompanysLimit: plan.client_companys_limit,
      invoicesLimit: plan.invoices_limit,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
    });
  }
}
