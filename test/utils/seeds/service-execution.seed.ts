import { ServiceExecution } from 'src/domain/entities/service-execution';
import { PrismaServiceExecutionMapper } from 'src/infra/services/prisma/mappers/prisma-service-execution.mapper';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';

export async function serviceExecutionSeed(
  prisma: PrismaService,
  data: {
    companyCnpj: string;
    clientCompanyId: string;
    serviceId: string;
    executedAt: Date;
  },
): Promise<{ serviceExecutionId: string }> {
  try {
    const company = await prisma.company.findUnique({
      where: { cnpj: data.companyCnpj },
    });

    if (!company) throw new Error('Company Not Found in serviceExecutionSeed');

    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) throw new Error('Service Not Found in serviceExecutionSeed');

    const serviceExecution = new ServiceExecution({
      ...data,
      price: service.base_price,
      status: 'DONE',
      companyId: company.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const raw = PrismaServiceExecutionMapper.toPrisma(serviceExecution);

    await prisma.serviceExecution.create({
      data: raw,
    });

    return { serviceExecutionId: serviceExecution.id };
  } catch (error) {
    throw new Error(`Error in serviceSeed: ${error}`);
  }
}
