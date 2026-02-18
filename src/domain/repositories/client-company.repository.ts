import { ClientCompany } from '../entities/client-company';

export const CLIENT_COMPANY_REPOSITORY = 'CLIENT_COMPANY_REPOSITORY';

export interface ClientCompanyRepository {
  save(clientCompany: ClientCompany): Promise<void>;
  findById(id: string): Promise<ClientCompany | null>;
  findRelation(
    companyId: string,
    clientId: string,
  ): Promise<ClientCompany | null>;
  findManyByCompany(companyId: string): Promise<ClientCompany[] | []>;
  update(clientCompany: ClientCompany): Promise<void>;
}
