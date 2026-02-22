import { Inject, Injectable } from '@nestjs/common';
import {
  SERVICE_REPOSITORY,
  type ServiceRespository,
} from 'src/domain/repositories/service.repository';
import { UpdateServiceDTO } from '../dtos/update-service.dto';
import { PriceConverter } from '../common/price-converter.common';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { Service } from 'src/domain/entities/service';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { NonBelongingException } from '../exceptions/non-belonging.exception';

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private serviceRepository: ServiceRespository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTrasnformService: DateTransformService,
  ) {}

  async handle(data: UpdateServiceDTO): Promise<{ service: Service }> {
    const service = await this.serviceRepository.findById(data.serviceId);
    if (!service)
      throw new EntityNotFoundException(
        `The Service of id: ${data.serviceId} not found`,
        'Service not found',
        UpdateServiceUseCase.name,
      );

    if (service.companyId !== data.companyId)
      throw new NonBelongingException(
        `The Service of id: ${data.serviceId} does not belong to the Company of id: ${data.companyId}`,
        'The service not belong to the company',
        UpdateServiceUseCase.name,
      );

    const basePrice = data.basePrice
      ? PriceConverter.toRepository(data.basePrice)
      : undefined;

    service.update({
      name: data.name,
      description: data.description,
      basePrice,
      now: this.dateTrasnformService.nowUTC(),
    });

    await this.serviceRepository.update(service);

    const serviceUpdated = await this.serviceRepository.findById(service.id);

    return { service: serviceUpdated! };
  }
}
