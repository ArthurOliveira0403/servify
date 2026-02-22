import { Inject } from '@nestjs/common';
import { ADMIN_REPOSITORY } from 'src/domain/repositories/admin.repository';
import type { AdminRepository } from 'src/domain/repositories/admin.repository';
import { SignInAdminDTO } from '../dtos/sign-in-admin.dto';
import { type IJwtService, JWT_SERVICE } from '../services/ijwt.service';
import {
  HASHER_SERVICE,
  type HasherService,
} from '../services/password-hasher.service';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

export class SignInAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private adminRepository: AdminRepository,
    @Inject(HASHER_SERVICE)
    private hasherService: HasherService,
    @Inject(JWT_SERVICE)
    private jwtService: IJwtService,
  ) {}

  async handle(data: SignInAdminDTO): Promise<{ accessToken: string }> {
    const adminExist = await this.adminRepository.findByEmail(data.email);

    if (!adminExist)
      throw new EntityNotFoundException(
        `Admin with ${data.email} email not found`,
        'Admin not found',
        SignInAdminUseCase.name,
      );

    if (!(await this.hasherService.compare(data.password, adminExist.password)))
      throw new InvalidCredentialsException(
        'Incorrect password',
        'Incorrect password',
        SignInAdminUseCase.name,
      );

    const accessToken = this.jwtService.sign({
      sub: adminExist.id,
      email: adminExist.email,
      role: adminExist.role,
    });

    return { accessToken };
  }
}
