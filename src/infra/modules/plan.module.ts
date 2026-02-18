import { Module } from '@nestjs/common';
import { PlanController } from '../http/controllers/plan.controller';
import { DatabaseModule } from 'src/infra/modules/database.module';
import { CreatePlanUseCase } from '../../application/use-cases/create-plan.use-case';
import { PLAN_REPOSITORY } from '../../domain/repositories/plan.repository';
import { PrismaPlanRepository } from '../services/prisma/repositories/prisma-plan.repository';

import { UpdatePlanUseCase } from '../../application/use-cases/update-plan.use-case';
import { DateTrasnformModule } from './date-transform.module';
import { ListPlansUseCase } from 'src/application/use-cases/list-plans.use-case';

@Module({
  imports: [DatabaseModule, DateTrasnformModule],
  controllers: [PlanController],
  providers: [
    CreatePlanUseCase,
    ListPlansUseCase,
    UpdatePlanUseCase,
    { provide: PLAN_REPOSITORY, useClass: PrismaPlanRepository },
  ],
  exports: [PLAN_REPOSITORY],
})
export class PlanModule {}
