import { Module } from '@nestjs/common';
import { CreateClientCompanyUseCase } from 'src/application/use-cases/create-client-company.use-case';
import { UpdateClientCompanyUseCase } from 'src/application/use-cases/update-client-company.use-case';
import { DatabaseModule } from './database.module';
import { CLIENT_COMPANY_REPOSITORY } from 'src/domain/repositories/client-company.repository';
import { ClientModule } from './client.module';
import { PrismaClientCompanyRepository } from '../services/prisma/repositories/prisma-client-company.repository';
import { ClientCompanyController } from '../http/controllers/client-company.controller';
import { DateTrasnformModule } from './date-transform.module';
import { ListClientsCompanyUseCase } from 'src/application/use-cases/list-clients-company.use-case';
import { SubscriptionModule } from './subscription.module';

@Module({
  imports: [
    DatabaseModule,
    ClientModule,
    DateTrasnformModule,
    SubscriptionModule,
  ],
  providers: [
    CreateClientCompanyUseCase,
    ListClientsCompanyUseCase,
    UpdateClientCompanyUseCase,
    {
      provide: CLIENT_COMPANY_REPOSITORY,
      useClass: PrismaClientCompanyRepository,
    },
  ],
  controllers: [ClientCompanyController],
  exports: [CLIENT_COMPANY_REPOSITORY],
})
export class ClientCompanyModule {}
