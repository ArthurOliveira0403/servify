import { Client as ClientPrisma } from '@prisma/client';
import { Client as ClientDomain } from 'src/domain/entities/client';

export class PrismaClientMapper {
  static toPrisma(client: ClientDomain) {
    return {
      id: client.id,
      full_name: client.fullName,
      international_id: client.internationalId,
      created_at: client.createdAt,
    };
  }

  static toDomain(client: ClientPrisma) {
    return new ClientDomain({
      id: client.id,
      fullName: client.full_name,
      internationalId: client.international_id,
      createdAt: client.created_at,
    });
  }
}
