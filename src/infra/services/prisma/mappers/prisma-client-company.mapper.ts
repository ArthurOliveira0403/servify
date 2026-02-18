import { ClientCompany as DomainClientCompany } from 'src/domain/entities/client-company';
import { ClientCompany as PrismaClientCompany } from '@prisma/client';

export class PrismaClientCompanyMapper {
  static toPrisma(clientCompany: DomainClientCompany) {
    return {
      id: clientCompany.id,
      company_id: clientCompany.companyId,
      client_id: clientCompany.clientId,
      email: clientCompany.email ?? undefined,
      phone: clientCompany.phone ?? undefined,
      created_at: clientCompany.createdAt,
      updated_at: clientCompany.updatedAt,
    };
  }

  static toDomain(clientCompany: PrismaClientCompany) {
    return new DomainClientCompany({
      id: clientCompany.id,
      companyId: clientCompany.company_id,
      clientId: clientCompany.client_id,
      email: clientCompany.email ?? undefined,
      phone: clientCompany.phone ?? undefined,
      createdAt: clientCompany.created_at,
      updatedAt: clientCompany.updated_at,
    });
  }
}
