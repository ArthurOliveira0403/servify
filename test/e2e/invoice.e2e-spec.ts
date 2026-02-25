/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { GlobalExceptionFilter } from 'src/infra/filters/global-exception.filter';
import { JwtAuthGuard } from 'src/infra/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infra/guards/roles.guard';
import { AuthModule } from 'src/infra/modules/auth.module';
import { InvoiceModule } from 'src/infra/modules/invoice.module';
import { CreateClientCompanyBodyDTO } from 'src/infra/schemas/create-client-company.schemas';
import { CreatePlanBodyDTO } from 'src/infra/schemas/create-plan.schemas';
import { CreateServiceBodyDTO } from 'src/infra/schemas/create-service.schemas';
import { SignUpBodyDTO } from 'src/infra/schemas/sign-up.schemas';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import { createSubscriptionHelper } from 'test/utils/helpers/create-subscription.helper';
import { singUpAndLogin } from 'test/utils/helpers/sign-up-and-login.helper';
import { clientCompanySeed } from 'test/utils/seeds/client-company.seed';
import { serviceExecutionSeed } from 'test/utils/seeds/service-execution.seed';
import { serviceSeed } from 'test/utils/seeds/service.seed';
import request from 'supertest';

describe('Invoice (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let token: string;

  const now = new Date('2026-01-01T00:00:00Z');

  let companyData: SignUpBodyDTO;

  let serviceExcutionId: string;
  let serviceExcutionId2: string;
  let serviceExcutionId3: string;

  beforeAll(async () => {
    const moduleTest: TestingModule = await Test.createTestingModule({
      imports: [InvoiceModule, AuthModule],
      providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_FILTER, useClass: GlobalExceptionFilter },
      ],
    }).compile();

    app = moduleTest.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = moduleTest.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Create company
    companyData = {
      name: 'Lumminus',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '123455432',
    };

    const { accessToken } = await singUpAndLogin(app, companyData);
    token = accessToken;

    // Create Subscription
    const createPlanData: CreatePlanBodyDTO = {
      name: 'BASIC',
      type: 'MONTHLY',
      price: 129.99,
      servicesLimit: 500,
      serviceExecutionsLimit: 500,
      clientCompanysLimit: 500,
      invoicesLimit: 2,
    };
    await createSubscriptionHelper(app, prisma, token, createPlanData);

    // Create Services
    const serviceData: CreateServiceBodyDTO = {
      name: 'A name',
      description: 'A description',
      basePrice: 129.99,
    };
    const responseService = await serviceSeed(prisma, {
      ...serviceData,
      companyCnpj: companyData.cnpj,
    });

    const serviceData2: CreateServiceBodyDTO = {
      name: 'A name2',
      description: 'A description2',
      basePrice: 159.99,
    };
    const responseService2 = await serviceSeed(prisma, {
      ...serviceData2,
      companyCnpj: companyData.cnpj,
    });

    const serviceData3: CreateServiceBodyDTO = {
      name: 'A name3',
      description: 'A description3',
      basePrice: 99.99,
    };
    const responseService3 = await serviceSeed(prisma, {
      ...serviceData3,
      companyCnpj: companyData.cnpj,
    });

    // Create ClientCompany
    const clientCompanyData: CreateClientCompanyBodyDTO = {
      internationalId: '123123',
      email: 'email@email.com',
      fullName: 'full name',
      phone: '2311233123',
    };
    const { clientCompanyId } = await clientCompanySeed(prisma, {
      ...clientCompanyData,
      companyCnpj: companyData.cnpj,
    });

    // Create ServiceExecution
    const createServiceExecutionData = {
      companyCnpj: companyData.cnpj,
      clientCompanyId,
      executedAt: now,
    };

    const executionSeedResponse = await serviceExecutionSeed(prisma, {
      ...createServiceExecutionData,
      serviceId: responseService.serviceId,
    });
    serviceExcutionId = executionSeedResponse.serviceExecutionId;

    const executionSeedResponse2 = await serviceExecutionSeed(prisma, {
      ...createServiceExecutionData,
      serviceId: responseService2.serviceId,
    });
    serviceExcutionId2 = executionSeedResponse2.serviceExecutionId;

    const executionSeedResponse3 = await serviceExecutionSeed(prisma, {
      ...createServiceExecutionData,
      serviceId: responseService3.serviceId,
    });
    serviceExcutionId3 = executionSeedResponse3.serviceExecutionId;
  });

  // ==================== Issue method ====================
  it('/invoice/:execution_id/issue (POST) - should issue a new invoice', async () => {
    const response = await request(app.getHttpServer())
      .post(`/invoice/${serviceExcutionId}/issue`)
      .set('Authorization', `Bearer ${token}`)
      .set('Timezone', 'Europe/Paris')
      .expect(201);

    expect(response.body.message).toBe('Invoice successfully created');
    expect(response.body).toHaveProperty('invoiceId');
  });

  it('/invoice/:execution_id/issue (POST) - should throw 409 when already exist a invoice of serviceExecution', async () => {
    await request(app.getHttpServer())
      .post(`/invoice/${serviceExcutionId}/issue`)
      .set('Authorization', `Bearer ${token}`)
      .set('Timezone', 'Europe/Paris')
      .expect(201);

    await request(app.getHttpServer())
      .post(`/invoice/${serviceExcutionId}/issue`)
      .set('Authorization', `Bearer ${token}`)
      .set('Timezone', 'Europe/Paris')
      .expect(409);
  });

  it('/invoice/:execution_id/issue (POST) - should throw 403 when the invoice subscription limit already reached', async () => {
    await request(app.getHttpServer())
      .post(`/invoice/${serviceExcutionId}/issue`)
      .set('Authorization', `Bearer ${token}`)
      .set('Timezone', 'Europe/Paris')
      .expect(201);

    await request(app.getHttpServer())
      .post(`/invoice/${serviceExcutionId2}/issue`)
      .set('Authorization', `Bearer ${token}`)
      .set('Timezone', 'Europe/Paris')
      .expect(201);

    await request(app.getHttpServer())
      .post(`/invoice/${serviceExcutionId3}/issue`)
      .set('Authorization', `Bearer ${token}`)
      .set('Timezone', 'Europe/Paris')
      .expect(403);
  });

  it('/invoice/:execution_id/issue (POST) - should return 403 when the company has not an active subscription', async () => {
    const { accessToken } = await singUpAndLogin(app, {
      name: 'otherCompany',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '232123',
    });

    await request(app.getHttpServer())
      .post(`/invoice/${serviceExcutionId}/issue`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Timezone', 'Europe/Paris')
      .expect(403);
  });

  // ==================== GeneratePdf method ====================
  it('/invoice/:id/pdf - should create a new pdf of invoice', async () => {
    const replyIssue = await request(app.getHttpServer())
      .post(`/invoice/${serviceExcutionId}/issue`)
      .set('Authorization', `Bearer ${token}`)
      .set('Timezone', 'Europe/Paris')
      .expect(201);

    const body = replyIssue.body;

    const response = await request(app.getHttpServer())
      .get(`/invoice/${body.invoiceId}/pdf`)
      .set('Authorization', `Bearer ${token}`)
      .buffer()
      .expect(200);

    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain(
      'inline; filename="nota-servico.pdf"',
    );

    console.log('this is headers:', response.headers);

    expect(Buffer.isBuffer(response.body)).toBe(true);
  }, 8000);
});
