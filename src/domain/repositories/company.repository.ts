import { Company } from '../entities/company';

export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';

export interface CompanyRepository {
  save(company: Company): Promise<void>;
  findById(id: string): Promise<Company | null>;
  findByEmail(email: string): Promise<Company | null>;
  findByCnpj(cnpj: string): Promise<Company | null>;
  update(company: Company): Promise<void>;
}
