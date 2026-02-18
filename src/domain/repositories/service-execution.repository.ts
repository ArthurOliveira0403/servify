import { ServiceExecution } from '../entities/service-execution';

export const SERVICE_EXECUTION_REPOSITORY = 'SERVICE_EXECUTION_REPOSITORY';

export interface ServiceExecutionRepository {
  save(serviceExecution: ServiceExecution): Promise<void>;
  findById(serviceExecutionId: string): Promise<ServiceExecution | null>;
  findManyByCompany(companyId: string): Promise<ServiceExecution[] | []>;
  findManyByClientCompany(
    clientCompanyId: string,
  ): Promise<ServiceExecution[] | []>;
}
