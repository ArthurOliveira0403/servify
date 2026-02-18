import { Module } from '@nestjs/common';
import { CompanyModule } from '../modules/company.module';
import { AuthModule } from '../modules/auth.module';
import { SubscriptionModule } from './subscription.module';
import { PlanModule } from '../modules/plan.module';
import { AdminModule } from './admin.module';
import { AdminAuthModule } from './admin-auth.module';
import { ServiceModule } from './service.module';
import { ClientModule } from './client.module';
import { HasherModule } from './hasher.module';
import { JwtModule } from './jwt.module';
import { ClientCompanyModule } from './client-company.module';
import { ServiceExecutionModule } from './service-execution.module';
import { InvoiceModule } from './invoice.module';
import { PdfModule } from './pdf.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { FeatureCounterModule } from './feature-counter.module';
import { ValidateUserModule } from './validate-user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CompanyModule,
    AuthModule,
    ServiceModule,
    ClientModule,
    ClientCompanyModule,
    ServiceExecutionModule,
    InvoiceModule,
    PdfModule,
    PlanModule,
    SubscriptionModule,
    AdminAuthModule,
    AdminModule,
    HasherModule,
    JwtModule,
    FeatureCounterModule,
    ValidateUserModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
