import { Inject, Injectable } from '@nestjs/common';
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
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { NonBelongingException } from '../exceptions/non-belonging.exception';

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
    if (!clientCompany)
      throw new EntityNotFoundException(
        `The Client Company of ${data.clientCompanyId} not found`,
        'Client Company not found',
        UpdateClientCompanyUseCase.name,
      );

    if (clientCompany.companyId !== data.companyId)
      throw new NonBelongingException(
        `The ClientCompany of id: ${data.clientCompanyId} does not belong to the Company of id: ${data.companyId}`,
        'The ClientCompany does not belong to the Company',
        UpdateClientCompanyUseCase.name,
      );

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

    if (!client)
      throw new EntityNotFoundException(
        `The Client of id: ${clientCompanyUpdated!.clientId} not found`,
        'Client Not Found',
        UpdateClientCompanyUseCase.name,
      );

    return { clientCompany: clientCompanyUpdated!, client };
  }
}
