import { Module } from '@nestjs/common';
import { CLIENT_REPOSITORY } from 'src/domain/repositories/client.repository';
import { PrismaClientRepository } from '../services/prisma/repositories/prisma-client.repository';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: CLIENT_REPOSITORY, useClass: PrismaClientRepository }],
  exports: [CLIENT_REPOSITORY],
})
export class ClientModule {}
