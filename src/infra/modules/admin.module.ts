import { Module } from '@nestjs/common';
import { ADMIN_REPOSITORY } from 'src/domain/repositories/admin.repository';
import { PrismaAdminRepository } from '../services/prisma/repositories/prisma-admin.respository';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: ADMIN_REPOSITORY, useClass: PrismaAdminRepository }],
  exports: [ADMIN_REPOSITORY],
})
export class AdminModule {}
