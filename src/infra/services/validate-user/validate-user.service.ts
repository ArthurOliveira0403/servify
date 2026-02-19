import { Injectable } from '@nestjs/common';
import { AuthUser } from 'src/application/common/auth-user.interface';
import {
  IValidateUserService,
  ValidaterUserServiceDTO,
} from 'src/application/services/ivalidate-user.service';
import { ValidateUserServiceException } from 'src/infra/exceptions/validate-user-service.exception';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ValidateUserService implements IValidateUserService {
  constructor(private prisma: PrismaService) {}

  async handle(data: ValidaterUserServiceDTO): Promise<AuthUser> {
    if (data.userRole === 'ADMIN') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: data.userId },
      });
      if (!admin)
        throw new ValidateUserServiceException(
          `Admin with ${data.userId} id not found`,
          'Admin not found',
          ValidateUserService.name,
        );

      return {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      } as AuthUser;
    }

    const company = await this.prisma.company.findUnique({
      where: { id: data.userId },
    });
    if (!company)
      throw new ValidateUserServiceException(
        `Company with ${data.userId} id not found`,
        'Company not found',
        ValidateUserService.name,
      );

    return {
      id: company.id,
      email: company.email,
      role: company.role,
    } as AuthUser;
  }
}
