import { Body, Controller, Patch } from '@nestjs/common';
import { UpdateCompanyUseCase } from 'src/application/use-cases/update-company.use-case';
import {
  type UpdateCompanyBodyDTO,
  updateCompanyBodySchema,
} from 'src/infra/schemas/update-company.schemas';
import { Zod } from 'src/infra/decorators/zod.decorator';
import { CompanyResponseMapper } from '../mappers/company-response.mapper';
import { CurrentUser } from 'src/infra/decorators/current-user.decorator';
import { AuthUser } from 'src/domain/common/auth-user.interface';
import { Roles } from 'src/infra/decorators/roles.decorator';

@Roles('COMPANY')
@Controller('company')
export class CompanyController {
  constructor(private updatedUseCase: UpdateCompanyUseCase) {}

  @Patch()
  async update(
    @CurrentUser() user: AuthUser,
    @Body(Zod(updateCompanyBodySchema)) data: UpdateCompanyBodyDTO,
  ) {
    const { company } = await this.updatedUseCase.handle(user.id, data);

    return {
      message: 'Company successfully updated',
      company: CompanyResponseMapper.showDetails(company),
    };
  }
}
