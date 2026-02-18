/* eslint-disable @typescript-eslint/await-thenable */
import { ServiceExecution } from 'src/domain/entities/service-execution';
import { ServiceExecutionRepository } from 'src/domain/repositories/service-execution.repository';

export class InMemoryServiceExecutionRespository
  implements ServiceExecutionRepository
{
  public servicesExecutions: ServiceExecution[] = [];

  async save(serviceExecution: ServiceExecution): Promise<void> {
    await this.servicesExecutions.push(serviceExecution);
  }

  async findById(serviceExecutionId: string): Promise<ServiceExecution | null> {
    const serviceExecutionFound = await this.servicesExecutions.find(
      (s) => s.id === serviceExecutionId,
    );

    return serviceExecutionFound ?? null;
  }

  async findManyByCompany(companyId: string): Promise<ServiceExecution[] | []> {
    const servicesExecutions = await this.servicesExecutions.filter(
      (s) => s.companyId === companyId,
    );

    return servicesExecutions ?? [];
  }

  async findManyByClientCompany(
    clientCompanyId: string,
  ): Promise<ServiceExecution[] | []> {
    const servicesExecutions = await this.servicesExecutions.filter(
      (s) => s.clientCompanyId === clientCompanyId,
    );

    return servicesExecutions ?? [];
  }
}
