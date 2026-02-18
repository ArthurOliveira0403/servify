import { Company } from 'src/domain/entities/company';

export class PrismaCompanyMapper {
  static toPrismaCreate(company: Company) {
    return {
      id: company.id,
      name: company.name,
      email: company.email,
      password: company.password,
      cnpj: company.cnpj,
      address: company.address
        ? {
            create: {
              country: company.address.country,
              state: company.address.state,
              city: company.address.city,
              street: company.address.street,
              number: company.address.number,
              zip_code: company.address.zipCode,
              complement: company.address.complement,
            },
          }
        : undefined,
      phone_number: company.phoneNumber ?? undefined,
      role: company.role,
      created_at: company.createdAt,
      updated_at: company.updatedAt,
    };
  }

  static toPrismaUpdate(company: Company) {
    return {
      name: company.name,
      cnpj: company.cnpj,
      address: company.address
        ? {
            upsert: {
              create: {
                country: company.address?.country,
                state: company.address?.state,
                city: company.address?.city,
                street: company.address?.street,
                number: company.address?.number,
                zip_code: company.address?.zipCode,
                complement: company.address?.complement,
              },
              update: {
                country: company.address?.country,
                state: company.address?.state,
                city: company.address?.city,
                street: company.address?.street,
                number: company.address?.number,
                zip_code: company.address?.zipCode,
                complement: company.address?.complement,
              },
            },
          }
        : undefined,
      phone_number: company.phoneNumber,
      created_at: company.createdAt,
      updated_at: company.updatedAt,
    };
  }
}
