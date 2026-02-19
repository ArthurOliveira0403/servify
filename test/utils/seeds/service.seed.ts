import { Service } from 'src/domain/entities/service';
import { PrismaServiceMapper } from 'src/infra/services/prisma/mappers/prisma-service.mapper';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';

export async function serviceSeed(
  prisma: PrismaService,
  data: {
    companyCnpj: string;
    name: string;
    description: string;
    basePrice: number;
  },
): Promise<{ serviceId: string }> {
  try {
    const company = await prisma.company.findUnique({
      where: { cnpj: data.companyCnpj },
    });

    if (!company) throw new Error('Company Not Found in serviceSeed');

    const service = new Service({
      ...data,
      companyId: company.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const raw = PrismaServiceMapper.toPrisma(service);

    await prisma.service.create({
      data: raw,
    });

    return { serviceId: service.id };
  } catch (error) {
    throw new Error(`Error in serviceSeed: ${error}`);
  }
}
