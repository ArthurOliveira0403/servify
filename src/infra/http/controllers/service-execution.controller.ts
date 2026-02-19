import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateServiceExecutionUseCase } from 'src/application/use-cases/create-service-execution.use-case';
import { AuthUser } from 'src/application/common/auth-user.interface';
import { CurrentUser } from 'src/infra/decorators/current-user.decorator';
import { Zod } from 'src/infra/decorators/zod.decorator';
import { SubscriptionGuard } from 'src/infra/guards/subscription.guard';
import {
  type CreateServiceExecutionBodyDTO,
  createServiceExecutionBodySchema,
} from 'src/infra/schemas/create-service-execution.schemas';

@Controller('service-execution')
export class ServiceExecutionController {
  constructor(
    private createServiceExecutionUseCase: CreateServiceExecutionUseCase,
  ) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  async create(
    @CurrentUser() user: AuthUser,
    @Body(Zod(createServiceExecutionBodySchema))
    data: CreateServiceExecutionBodyDTO,
  ) {
    const { serviceExecutionId } =
      await this.createServiceExecutionUseCase.handle({
        ...data,
        companyId: user.id,
      });
    return {
      message: 'Service execution successfully created',
      serviceExecutionId,
    };
  }
}
