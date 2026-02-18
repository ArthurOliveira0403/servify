import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  SERVICE_EXECUTION_REPOSITORY,
  type ServiceExecutionRepository,
} from 'src/domain/repositories/service-execution.repository';
import { CreateServiceExecutionDTO } from '../dtos/create-service-execution.dto';
import {
  SERVICE_REPOSITORY,
  type ServiceRespository,
} from 'src/domain/repositories/service.repository';
import {
  CLIENT_COMPANY_REPOSITORY,
  type ClientCompanyRepository,
} from 'src/domain/repositories/client-company.repository';
import { ServiceExecution } from 'src/domain/entities/service-execution';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { Feature } from 'src/domain/entities/subscription';
import {
  type ISubscriptionPolicyService,
  SUBSCRIPTION_POLICY_SERVICE,
} from '../services/isubcription-policy.service';

@Injectable()
export class CreateServiceExecutionUseCase {
  constructor(
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private serviceExecutionRepository: ServiceExecutionRepository,
    @Inject(SERVICE_REPOSITORY)
    private serviceRepository: ServiceRespository,
    @Inject(CLIENT_COMPANY_REPOSITORY)
    private clientCompanyRepository: ClientCompanyRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
    @Inject(SUBSCRIPTION_POLICY_SERVICE)
    private subscriptionPolicyService: ISubscriptionPolicyService,
  ) {}

  async handle(
    data: CreateServiceExecutionDTO,
  ): Promise<{ serviceExecutionId: string }> {
    await this.subscriptionPolicyService.handle(
      data.companyId,
      Feature.SERVICE_EXECUTION,
    );

    const service = await this.serviceRepository.findById(data.serviceId);
    if (!service) throw new NotFoundException('Service not found');

    const clientCompany = await this.clientCompanyRepository.findById(
      data.clientCompanyId,
    );
    if (!clientCompany) throw new NotFoundException('Client company not found');

    if (
      service.companyId !== clientCompany.companyId ||
      service.companyId !== data.companyId
    )
      throw new ForbiddenException(
        'Service and client company do not belong to the same company',
      );

    const serviceExecution = new ServiceExecution({
      companyId: service.companyId,
      serviceId: service.id,
      clientCompanyId: clientCompany.id,
      executedAt: this.dateTransformService.toUTC(new Date(data.executedAt)),
      price: service.basePrice,
      createdAt: this.dateTransformService.nowUTC(),
      updatedAt: this.dateTransformService.nowUTC(),
    });

    await this.serviceExecutionRepository.save(serviceExecution);

    const serviceExecutionId = serviceExecution.id;

    return { serviceExecutionId };
  }
}
