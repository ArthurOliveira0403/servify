/* eslint-disable @typescript-eslint/await-thenable */
import { ClientCompany } from 'src/domain/entities/client-company';
import { ClientCompanyRepository } from 'src/domain/repositories/client-company.repository';

export class InMemoryClientCompanyRepository
  implements ClientCompanyRepository
{
  public clientsCompany: ClientCompany[] = [];

  async save(clientCompany: ClientCompany): Promise<void> {
    await this.clientsCompany.push(clientCompany);
  }

  async findById(id: string): Promise<ClientCompany | null> {
    const clientCompany = await this.clientsCompany.find((c) => c.id === id);
    return clientCompany ?? null;
  }

  async findManyByCompany(companyId: string): Promise<ClientCompany[] | []> {
    const clientsCompany = await this.clientsCompany.filter(
      (c) => c.companyId === companyId,
    );
    return clientsCompany ?? [];
  }

  async findRelation(
    companyId: string,
    clientId: string,
  ): Promise<ClientCompany | null> {
    const clientCompany = await this.clientsCompany.find(
      (c) => c.companyId === companyId && c.clientId === clientId,
    );

    return clientCompany ?? null;
  }

  async update(clientCompany: ClientCompany): Promise<void> {
    const index = await this.clientsCompany.findIndex(
      (c) => c.id === clientCompany.id,
    );
    if (index === -1) throw new Error('ClientCompany not found');
    this.clientsCompany[index] = clientCompany;
  }
}
