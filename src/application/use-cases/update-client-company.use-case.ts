import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { UpdateClientCompanyDTO } from '../dtos/update-client-company.dto';
import {
  CLIENT_COMPANY_REPOSITORY,
  type ClientCompanyRepository,
} from 'src/domain/repositories/client-company.repository';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { ClientCompanyWithClientDTO } from '../dtos/shared/client-company-with-client.dto';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
} from 'src/domain/repositories/client.repository';

@Injectable()
export class UpdateClientCompanyUseCase {
  constructor(
    @Inject(CLIENT_COMPANY_REPOSITORY)
    private clientCompanyRepository: ClientCompanyRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
    @Inject(CLIENT_REPOSITORY)
    private clientRepository: ClientRepository,
  ) {}

  async handle(
    data: UpdateClientCompanyDTO,
  ): Promise<ClientCompanyWithClientDTO> {
    const clientCompany = await this.clientCompanyRepository.findById(
      data.clientCompanyId,
    );
    if (!clientCompany) throw new NotFoundException('Client Company not found');

    if (clientCompany.companyId !== data.companyId)
      throw new UnauthorizedException('Update not allowed');

    clientCompany.updateDetails({
      email: data.email,
      phone: data.phone,
      now: this.dateTransformService.nowUTC(),
    });

    await this.clientCompanyRepository.update(clientCompany);

    const clientCompanyUpdated = await this.clientCompanyRepository.findById(
      clientCompany.id,
    );

    const client = await this.clientRepository.findById(clientCompany.clientId);

    if (!client) throw new NotFoundException('Client Not Found');

    return { clientCompany: clientCompanyUpdated!, client };
  }
}
