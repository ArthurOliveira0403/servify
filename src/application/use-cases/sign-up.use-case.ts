import { Inject, Injectable } from '@nestjs/common';
import type { CompanyRepository } from 'src/domain/repositories/company.repository';
import { SignUpDTO } from '../dtos/sign-up.dto';
import { Company } from 'src/domain/entities/company';
import { COMPANY_REPOSITORY } from 'src/domain/repositories/company.repository';
import {
  HASHER_SERVICE,
  type HasherService,
} from '../services/password-hasher.service';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { AlreadyExistException } from '../exceptions/already-exist.exception';

@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private companyRepository: CompanyRepository,
    @Inject(HASHER_SERVICE)
    private passwordHasher: HasherService,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
  ) {}

  async handle(data: SignUpDTO): Promise<void> {
    const companyByEmail = await this.companyRepository.findByEmail(data.email);

    if (companyByEmail)
      throw new AlreadyExistException(
        `The company of email: ${data.email} already exist`,
        'The company with this email already exist',
        SignUpUseCase.name,
      );

    const companyByCnpj = await this.companyRepository.findByCnpj(data.cnpj);

    if (companyByCnpj)
      throw new AlreadyExistException(
        `The company of cnpj: ${data.cnpj} already exist`,
        'The company with this cnpj already exist',
        SignUpUseCase.name,
      );

    const hashPassword = await this.passwordHasher.hash(data.password);

    const company = new Company({
      ...data,
      password: hashPassword,
      createdAt: this.dateTransformService.nowUTC(),
      updatedAt: this.dateTransformService.nowUTC(),
    });

    await this.companyRepository.save(company);
  }
}
