import { Subscription } from 'src/domain/entities/subscription';
import { Subscription as SubPrisma } from '@prisma/client';

export class PrismaSubscriptionMapper {
  static toPrisma(subscription: Subscription) {
    return {
      id: subscription.id,
      company_id: subscription.companyId,
      plan_id: subscription.planId,
      plan_name: subscription.planName,
      plan_type: subscription.planType,
      price: subscription.price,
      services_limit: subscription.servicesLimit,
      service_executions_limit: subscription.serviceExecutionsLimit,
      client_companys_limit: subscription.clientCompanysLimit,
      invoices_limit: subscription.invoicesLimit,
      status: subscription.status,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      renewal_date: subscription.renewalDate,
      auto_renew: subscription.autoRenew,
      created_at: subscription.createdAt,
      updated_at: subscription.updatedAt,
    };
  }

  static toDomain(subscription: SubPrisma): Subscription {
    return new Subscription({
      ...subscription,
      companyId: subscription.company_id,
      planId: subscription.plan_id,
      planName: subscription.plan_name,
      planType: subscription.plan_type,
      servicesLimit: subscription.services_limit,
      serviceExecutionsLimit: subscription.service_executions_limit,
      clientCompanysLimit: subscription.client_companys_limit,
      invoicesLimit: subscription.invoices_limit,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      renewalDate: subscription.renewal_date,
      autoRenew: subscription.auto_renew,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at,
    });
  }
}
