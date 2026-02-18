import { Module } from '@nestjs/common';
import { SignInAdminUseCase } from 'src/application/use-cases/sign-in-admin.use-case';
import { AdminAuthController } from '../http/controllers/admin-auth.controller';
import { AdminModule } from './admin.module';
import { JwtModule } from './jwt.module';
import { HasherModule } from './hasher.module';

@Module({
  imports: [AdminModule, JwtModule, HasherModule],
  controllers: [AdminAuthController],
  providers: [SignInAdminUseCase],
})
export class AdminAuthModule {}
