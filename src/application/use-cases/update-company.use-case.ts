import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private companyRepository: CompanyRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTrasformService: DateTransformService,
  ) {}

  async handle(
    id: string,
    data: UpdateCompanyDTO,
  ): Promise<{ company: Company }> {
    const company = await this.companyRepository.findById(id);
    if (!company) throw new NotFoundException('Company not found');

    company.update({ ...data, now: this.dateTrasformService.nowUTC() });

    await this.companyRepository.update(company);

    return { company };
  }
}
