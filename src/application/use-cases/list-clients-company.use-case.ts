import { Inject, Injectable } from '@nestjs/common';
import {
  ListAllClientsCompanyDTO,
  ListOneClientCompanyDTO,
} from '../dtos/list-clients-company.dto';
import { ClientCompany } from 'src/domain/entities/client-company';
import {
  CLIENT_COMPANY_REPOSITORY,
  type ClientCompanyRepository,
} from 'src/domain/repositories/client-company.repository';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
} from 'src/domain/repositories/client.repository';
import { ClientCompanyWithClientDTO } from '../dtos/shared/client-company-with-client.dto';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { NonBelongingException } from '../exceptions/non-belonging.exception';

@Injectable()
export class ListClientsCompanyUseCase {
  constructor(
    @Inject(CLIENT_COMPANY_REPOSITORY)
    private clientCompanyRepository: ClientCompanyRepository,
    @Inject(CLIENT_REPOSITORY)
    private clientRepository: ClientRepository,
  ) {}

  async all(
    data: ListAllClientsCompanyDTO,
  ): Promise<ClientCompanyWithClientDTO[]> {
    const clientsCompany = await this.clientCompanyRepository.findManyByCompany(
      data.companyId,
    );

    if (clientsCompany.length === 0) return [];

    return Promise.all(
      clientsCompany.map(async (cc: ClientCompany) => {
        const client = await this.clientRepository.findById(cc.clientId);

        if (!client)
          throw new EntityNotFoundException(
            `Client of id: ${cc.clientId} not found`,
            `Client not found`,
            ListClientsCompanyUseCase.name,
          );

        return { clientCompany: cc, client };
      }),
    );
  }

  async one(
    data: ListOneClientCompanyDTO,
  ): Promise<ClientCompanyWithClientDTO> {
    const clientCompany = await this.clientCompanyRepository.findById(
      data.clientCompanyId,
    );

    if (!clientCompany)
      throw new EntityNotFoundException(
        `ClientCompany of id: ${data.clientCompanyId} not found`,
        'ClientCompany Not Found',
        ListClientsCompanyUseCase.name,
      );
    if (clientCompany.companyId !== data.companyId)
      throw new NonBelongingException(
        `The ClientCompany of id: ${data.clientCompanyId} does not belong the Company of id: ${data.companyId}`,
        'The Client Company does not belong to the Company',
        ListClientsCompanyUseCase.name,
      );

    const client = await this.clientRepository.findById(clientCompany.clientId);

    if (!client)
      throw new EntityNotFoundException(
        `Client of id: ${clientCompany.clientId} not found`,
        'Client not found',
        ListClientsCompanyUseCase.name,
      );

    return { clientCompany, client };
  }
}
