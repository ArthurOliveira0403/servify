import { Module } from '@nestjs/common';
import { ClientModule } from './client.module';
import { CreateServiceUseCase } from 'src/application/use-cases/create-service.use-case';
import { ServiceController } from '../http/controllers/service.controller';
import { SERVICE_REPOSITORY } from 'src/domain/repositories/service.repository';
import { PrismaServiceRepository } from '../services/prisma/repositories/prisma-service.repository';
import { DatabaseModule } from './database.module';
import { UpdateServiceUseCase } from 'src/application/use-cases/update-service.use-case';
import { DeleteServiceUseCase } from 'src/application/use-cases/delete-service.use-case';
import { ListServicesUseCase } from 'src/application/use-cases/list-services.use-case';
import { JwtModule } from './jwt.module';
import { DateTrasnformModule } from './date-transform.module';
import { SubscriptionModule } from './subscription.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule,
    ClientModule,
    DateTrasnformModule,
    SubscriptionModule,
  ],
  providers: [
    CreateServiceUseCase,
    ListServicesUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    { provide: SERVICE_REPOSITORY, useClass: PrismaServiceRepository },
  ],
  controllers: [ServiceController],
  exports: [SERVICE_REPOSITORY],
})
export class ServiceModule {}
