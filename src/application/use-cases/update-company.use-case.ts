import { Inject, Injectable } from '@nestjs/common';
import { UpdateCompanyDTO } from '../dtos/update-company.dto';
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from 'src/domain/repositories/company.repository';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { Company } from 'src/domain/entities/company';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private companyRepository: CompanyRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTrasformService: DateTransformService,
  ) {}

  async handle(data: UpdateCompanyDTO): Promise<{ company: Company }> {
    const company = await this.companyRepository.findById(data.companyId);
    if (!company)
      throw new EntityNotFoundException(
        `The Company of id: ${data.companyId} not found`,
        'Company not found',
        UpdateCompanyUseCase.name,
      );

    company.update({
      name: data.name,
      address: data.address,
      phoneNumber: data.phoneNumber,
      now: this.dateTrasformService.nowUTC(),
    });

    await this.companyRepository.update(company);

    return { company };
  }
}
