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
import { DeleteServiceDTO } from '../dtos/delete-service.dto';

@Injectable()
export class DeleteServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private serviceRepository: ServiceRespository,
  ) {}

  async handle(data: DeleteServiceDTO): Promise<void> {
    const service = await this.serviceRepository.findById(data.serviceId);
    if (!service) throw new NotFoundException('Service not found');

    if (service.companyId !== data.companyId)
      throw new ForbiddenException('The service belong not to this company');

    await this.serviceRepository.delete(data.serviceId);
  }
}
