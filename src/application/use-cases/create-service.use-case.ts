import {
  SERVICE_REPOSITORY,
  type ServiceRespository,
} from 'src/domain/repositories/service.repository';
import { CreateServiceDTO } from '../dtos/create-service.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Service } from 'src/domain/entities/service';

import { PriceConverter } from '../common/price-converter.common';
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
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private serviceRepository: ServiceRespository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformSevice: DateTransformService,
    @Inject(SUBSCRIPTION_POLICY_SERVICE)
    private subscriptionPolicyService: ISubscriptionPolicyService,
  ) {}

  async handle(data: CreateServiceDTO): Promise<{ serviceId: string }> {
    await this.subscriptionPolicyService.handle(
      data.companyId,
      Feature.SERVICE,
    );

    const basePrice = PriceConverter.toRepository(data.basePrice);

    const service = new Service({
      companyId: data.companyId,
      name: data.name,
      description: data.description,
      basePrice,
      createdAt: this.dateTransformSevice.nowUTC(),
      updatedAt: this.dateTransformSevice.nowUTC(),
    });

    await this.serviceRepository.save(service);

    const serviceId = service.id;

    return { serviceId };
  }
}
