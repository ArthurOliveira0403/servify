import { Client } from 'src/domain/entities/client';
import { ClientCompany } from 'src/domain/entities/client-company';
import { PrismaClientCompanyMapper } from 'src/infra/services/prisma/mappers/prisma-client-company.mapper';
import { PrismaClientMapper } from 'src/infra/services/prisma/mappers/prisma-client.mapper';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';

export async function clientCompanySeed(
  prisma: PrismaService,
  data: {
    companyCnpj: string;
    fullName: string;
    internationalId: string;
    email?: string;
    phone?: string;
  },
): Promise<{ clientCompanyId: string }> {
  try {
    const company = await prisma.company.findUnique({
      where: { cnpj: data.companyCnpj },
    });

    if (!company) throw new Error('Company Not Found in serviceSeed');

    const client = new Client({
      fullName: data.fullName,
      internationalId: data.internationalId,
      createdAt: new Date(),
    });

    const clientRaw = PrismaClientMapper.toPrisma(client);

    const clientCompany = new ClientCompany({
      companyId: company.id,
      clientId: client.id,
      email: data.email,
      phone: data.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const clientCompanyRaw = PrismaClientCompanyMapper.toPrisma(clientCompany);

    await prisma.$transaction([
      prisma.client.create({
        data: clientRaw,
      }),
      prisma.clientCompany.create({
        data: clientCompanyRaw,
      }),
    ]);

    return { clientCompanyId: clientCompany.id };
  } catch (error) {
    throw new Error(`Erro in clientCompanySeed: ${error}`);
  }
}
