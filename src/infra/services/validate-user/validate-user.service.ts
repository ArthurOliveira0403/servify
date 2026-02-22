import { Injectable } from '@nestjs/common';
import { AuthUser } from 'src/application/common/auth-user.interface';
import {
  IValidateUserService,
  ValidaterUserServiceDTO,
} from 'src/application/services/ivalidate-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserNotFoundException } from 'src/infra/exceptions/user-not-found.exception';

@Injectable()
export class ValidateUserService implements IValidateUserService {
  constructor(private prisma: PrismaService) {}

  async handle(data: ValidaterUserServiceDTO): Promise<AuthUser> {
    if (data.userRole === 'ADMIN') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: data.userId },
      });
      if (!admin)
        throw new UserNotFoundException(
          `Admin with ${data.userId} id not found`,
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
      throw new UserNotFoundException(
        `Company with ${data.userId} id not found`,
        ValidateUserService.name,
      );

    return {
      id: company.id,
      email: company.email,
      role: company.role,
    } as AuthUser;
  }
}
