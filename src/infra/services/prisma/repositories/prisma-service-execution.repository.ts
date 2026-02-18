import { ServiceExecutionRepository } from 'src/domain/repositories/service-execution.repository';
import { PrismaService } from '../prisma.service';
import { ServiceExecution } from 'src/domain/entities/service-execution';
import { PrismaServiceExecutionMapper } from '../mappers/prisma-service-execution.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaServiceExecutionRepository
  implements ServiceExecutionRepository
{
  constructor(private prisma: PrismaService) {}

  async save(serviceExecution: ServiceExecution): Promise<void> {
    const raw = PrismaServiceExecutionMapper.toPrisma(serviceExecution);

    await this.prisma.serviceExecution.create({
      data: { ...raw },
    });
  }

  async findById(serviceExecutionId: string): Promise<ServiceExecution | null> {
    const serviceExecution = await this.prisma.serviceExecution.findUnique({
      where: { id: serviceExecutionId },
    });

    return serviceExecution
      ? PrismaServiceExecutionMapper.toDomain(serviceExecution)
      : null;
  }

  async findManyByCompany(companyId: string): Promise<ServiceExecution[] | []> {
    const servicesExecutions = await this.prisma.serviceExecution.findMany({
      where: { company_id: companyId },
    });

    if (!servicesExecutions) return [];

    const raw = servicesExecutions.map((s) =>
      PrismaServiceExecutionMapper.toDomain(s),
    );

    return raw;
  }

  async findManyByClientCompany(
    clientCompanyId: string,
  ): Promise<ServiceExecution[] | []> {
    const servicesExecutions = await this.prisma.serviceExecution.findMany({
      where: { client_company_id: clientCompanyId },
    });

    if (!servicesExecutions) return [];

    const raw = servicesExecutions.map((s) =>
      PrismaServiceExecutionMapper.toDomain(s),
    );

    return raw;
  }
}
