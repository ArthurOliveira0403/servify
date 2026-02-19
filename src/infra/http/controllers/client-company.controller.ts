import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateClientCompanyUseCase } from 'src/application/use-cases/create-client-company.use-case';
import { UpdateClientCompanyUseCase } from 'src/application/use-cases/update-client-company.use-case';
import { Zod } from 'src/infra/decorators/zod.decorator';
import { ClientCompanyResponseMapper } from 'src/infra/http/mappers/client-company-response.mapper';
import {
  createClientCompanyBodySchema,
  type CreateClientCompanyBodyDTO,
} from 'src/infra/schemas/create-client-company.schemas';
import {
  type UpdateClientCompanyBodyDTO,
  type UpdateClientCompanyParamDTO,
  updateClientCompanyBodySchema,
  updateClientCompanyParamSchema,
} from 'src/infra/schemas/update-client-company.schemas';
import { ListClientsCompanyUseCase } from 'src/application/use-cases/list-clients-company.use-case';
import {
  listOneClientCompanySchemaParam,
  type ListOneClientCompanyParamDTO,
} from 'src/infra/schemas/list-one-client-company.schema';
import { SubscriptionGuard } from 'src/infra/guards/subscription.guard';
import { Roles } from 'src/infra/decorators/roles.decorator';
import { CurrentUser } from 'src/infra/decorators/current-user.decorator';
import { AuthUser } from 'src/application/common/auth-user.interface';

@Roles('COMPANY')
@Controller('client-company')
export class ClientCompanyController {
  constructor(
    private createClientCompanyUseCase: CreateClientCompanyUseCase,
    private listClientsCompanyUseCase: ListClientsCompanyUseCase,
    private updateClientCompanyUseCase: UpdateClientCompanyUseCase,
  ) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  async create(
    @CurrentUser() user: AuthUser,
    @Body(Zod(createClientCompanyBodySchema)) data: CreateClientCompanyBodyDTO,
  ) {
    const { clientCompanyId } = await this.createClientCompanyUseCase.handle({
      ...data,
      companyId: user.id,
    });

    return {
      message: 'Client Company successfully created',
      clientCompanyId,
    };
  }

  @Get()
  @UseGuards(SubscriptionGuard)
  async findAll(@CurrentUser() user: AuthUser) {
    const response = await this.listClientsCompanyUseCase.all({
      companyId: user.id,
    });

    return response.map((r) =>
      ClientCompanyResponseMapper.handle(r.clientCompany, r.client),
    );
  }

  @Get(':id')
  @UseGuards(SubscriptionGuard)
  async findOne(
    @Param('id', Zod(listOneClientCompanySchemaParam))
    id: ListOneClientCompanyParamDTO,
    @CurrentUser() user: AuthUser,
  ) {
    const { clientCompany, client } = await this.listClientsCompanyUseCase.one({
      companyId: user.id,
      clientCompanyId: id,
    });

    return ClientCompanyResponseMapper.handle(clientCompany, client);
  }

  @Patch(':id')
  @UseGuards(SubscriptionGuard)
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', Zod(updateClientCompanyParamSchema))
    id: UpdateClientCompanyParamDTO,
    @Body(Zod(updateClientCompanyBodySchema)) data: UpdateClientCompanyBodyDTO,
  ) {
    const { clientCompany, client } =
      await this.updateClientCompanyUseCase.handle({
        ...data,
        companyId: user.id,
        clientCompanyId: id,
      });

    return {
      message: 'Client Company successfully updated',
      clientCompany: ClientCompanyResponseMapper.handle(clientCompany, client),
    };
  }
}
