/* eslint-disable @typescript-eslint/require-await */
import { Company } from 'src/domain/entities/company';
import { CompanyRepository } from 'src/domain/repositories/company.repository';

export class InMemoryCompanyRepository implements CompanyRepository {
  public companys: Company[] = [];

  async save(company: Company): Promise<void> {
    this.companys.push(company);
  }
  async findById(id: string): Promise<Company | null> {
    const company = this.companys.find((c) => c.id === id);
    return company ?? null;
  }
  async findByEmail(email: string): Promise<Company | null> {
    const company = this.companys.find((c) => c.email === email);
    return company ?? null;
  }
  async findByCnpj(cnpj: string): Promise<Company | null> {
    const company = this.companys.find((c) => c.cnpj === cnpj);
    return company ?? null;
  }
  async update(company: Company): Promise<void> {
    const index = this.companys.findIndex((c) => c.id === company.id);
    if (index === -1) throw new Error('Company not found');

    this.companys[index] = company;
  }
}
