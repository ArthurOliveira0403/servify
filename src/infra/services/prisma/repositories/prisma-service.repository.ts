import { Service } from 'src/domain/entities/service';
import { ServiceRespository } from 'src/domain/repositories/service.repository';
import { PrismaService } from '../prisma.service';
import { PrismaServiceMapper } from '../mappers/prisma-service.mapper';
import { Injectable } from '@nestjs/common';
import { PrismaWrapper } from '../wrapper/prisma.wrapper';

@Injectable()
export class PrismaServiceRepository implements ServiceRespository {
  constructor(private prisma: PrismaService) {}

  async save(service: Service): Promise<void> {
    return await PrismaWrapper.handle(async () => {
      const row = PrismaServiceMapper.toPrisma(service);

      await this.prisma.service.create({
        data: row,
      });
    });
  }

  async update(service: Service): Promise<void> {
    return await PrismaWrapper.handle(async () => {
      const row = PrismaServiceMapper.toPrisma(service);

      await this.prisma.service.update({
        where: { id: service.id },
        data: row,
      });
    });
  }

  async delete(id: string): Promise<void> {
    return await PrismaWrapper.handle(async () => {
      await this.prisma.service.delete({ where: { id } });
    });
  }

  async findById(id: string): Promise<Service | null> {
    return await PrismaWrapper.handle(async () => {
      const service = await this.prisma.service.findUnique({ where: { id } });
      if (!service) return null;

      return PrismaServiceMapper.toDomain(service);
    });
  }

  async findManyByCompany(companyId: string): Promise<Service[] | []> {
    return await PrismaWrapper.handle(async () => {
      const services = await this.prisma.service.findMany({
        where: { company_id: companyId },
      });

      if (!services) return [];

      return services.map((s) => PrismaServiceMapper.toDomain(s));
    });
  }
}
