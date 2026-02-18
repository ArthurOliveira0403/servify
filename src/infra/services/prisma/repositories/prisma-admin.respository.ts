import { Admin } from 'src/domain/entities/admin';
import { AdminRepository } from 'src/domain/repositories/admin.repository';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Admin | null> {
    const adminExist = await this.prisma.admin.findUnique({ where: { email } });

    if (!adminExist) return null;

    const admin = new Admin({ ...adminExist });

    return admin;
  }

  async findById(id: string): Promise<Admin | null> {
    const adminExists = await this.prisma.admin.findUnique({ where: { id } });

    if (!adminExists) return null;

    const admin = new Admin({ ...adminExists });

    return admin;
  }
}
