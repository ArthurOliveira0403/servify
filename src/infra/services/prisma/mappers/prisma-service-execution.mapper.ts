import { ServiceExecution as DomainServiceExecution } from 'src/domain/entities/service-execution';
import { ServiceExecution as PrismaServiceExecution } from '@prisma/client';

export class PrismaServiceExecutionMapper {
  static toPrisma(serviceExecution: DomainServiceExecution) {
    return {
      id: serviceExecution.id,
      company_id: serviceExecution.companyId,
      service_id: serviceExecution.serviceId,
      client_company_id: serviceExecution.clientCompanyId,
      price: serviceExecution.price,
      status: serviceExecution.status,
      executed_at: serviceExecution.executedAt,
      created_at: serviceExecution.createdAt,
      updated_at: serviceExecution.updatedAt,
    };
  }

  static toDomain(serviceExecution: PrismaServiceExecution) {
    return new DomainServiceExecution({
      ...serviceExecution,
      companyId: serviceExecution.company_id,
      serviceId: serviceExecution.service_id,
      clientCompanyId: serviceExecution.client_company_id,
      executedAt: serviceExecution.executed_at,
      createdAt: serviceExecution.created_at,
      updatedAt: serviceExecution.updated_at,
    });
  }
}
