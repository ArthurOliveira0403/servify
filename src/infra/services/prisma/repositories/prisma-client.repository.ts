import { Client } from 'src/domain/entities/client';
import { ClientRepository } from 'src/domain/repositories/client.repository';
import { PrismaService } from '../prisma.service';
import { PrismaClientMapper } from '../mappers/prisma-client.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private prisma: PrismaService) {}

  async save(client: Client): Promise<void> {
    const row = PrismaClientMapper.toPrisma(client);

    await this.prisma.client.create({
      data: row,
    });
  }

  async findById(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) return null;

    return PrismaClientMapper.toDomain(client);
  }

  async findByInternationalId(internationalId: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { international_id: internationalId },
    });

    if (!client) return null;

    return PrismaClientMapper.toDomain(client);
  }
}
