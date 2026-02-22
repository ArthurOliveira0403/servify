import { Inject, Injectable } from '@nestjs/common';
import type { CompanyRepository } from 'src/domain/repositories/company.repository';
import { COMPANY_REPOSITORY } from 'src/domain/repositories/company.repository';
import { SignInDTO } from '../dtos/sign-in.dto';
import { type IJwtService, JWT_SERVICE } from '../services/ijwt.service';
import {
  HASHER_SERVICE,
  type HasherService,
} from '../services/password-hasher.service';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Injectable()
export class SignInUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private companyRepository: CompanyRepository,
    @Inject(HASHER_SERVICE)
    private passwordHasher: HasherService,
    @Inject(JWT_SERVICE)
    private tokenService: IJwtService,
  ) {}
  async handle(data: SignInDTO): Promise<string> {
    const company = await this.companyRepository.findByEmail(data.email);

    if (!company)
      throw new EntityNotFoundException(
        `Company of email: ${data.email} not found`,
        'Company not found',
        SignInUseCase.name,
      );

    const isMatch = await this.passwordHasher.compare(
      data.password,
      company.password,
    );

    if (!isMatch)
      throw new InvalidCredentialsException(
        'Incorrect password',
        'Incorrect password',
        SignInUseCase.name,
      );

    const accessToken = this.tokenService.sign({
      sub: company.id,
      email: company.email,
      role: company.role,
    });

    return accessToken;
  }
}
