import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
          throw new NotFoundException(
            `Client of ClientCompany: ${cc.id} not found`,
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

    if (!clientCompany) throw new NotFoundException('ClientCompany Not Found');
    if (clientCompany.companyId !== data.companyId)
      throw new UnauthorizedException(
        'The Client Company does not belong this company',
      );

    const client = await this.clientRepository.findById(clientCompany.clientId);

    if (!client) throw new NotFoundException('Client Not Found');

    return { clientCompany, client };
  }
}
