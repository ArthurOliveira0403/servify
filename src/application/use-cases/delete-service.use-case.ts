import { Inject, Injectable } from '@nestjs/common';
import {
  SERVICE_REPOSITORY,
  type ServiceRespository,
} from 'src/domain/repositories/service.repository';
import { DeleteServiceDTO } from '../dtos/delete-service.dto';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { NonBelongingException } from '../exceptions/non-belonging.exception';

@Injectable()
export class DeleteServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private serviceRepository: ServiceRespository,
  ) {}

  async handle(data: DeleteServiceDTO): Promise<void> {
    const service = await this.serviceRepository.findById(data.serviceId);
    if (!service)
      throw new EntityNotFoundException(
        `Service of id: ${data.serviceId} not found`,
        'Service not found',
        DeleteServiceUseCase.name,
      );

    if (service.companyId !== data.companyId)
      throw new NonBelongingException(
        `The Service of id: ${data.serviceId} not belong to the company of id: ${data.companyId}`,
        'The service does not belong to this company',
        DeleteServiceUseCase.name,
      );

    await this.serviceRepository.delete(data.serviceId);
  }
}
