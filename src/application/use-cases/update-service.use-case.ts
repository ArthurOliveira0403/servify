import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    if (!service) throw new NotFoundException('Service not found');

    if (service.companyId !== data.companyId)
      throw new ForbiddenException('The service not belong to the company');

    const basePrice = data.basePrice
      ? PriceConverter.toRepository(data.basePrice)
      : undefined;

    service.update({
      name: data.name,
      description: data.description,
      basePrice,
      updatedAt: this.dateTrasnformService.nowUTC(),
    });

    await this.serviceRepository.update(service);

    const serviceUpdated = await this.serviceRepository.findById(service.id);

    return { service: serviceUpdated! };
  }
}
