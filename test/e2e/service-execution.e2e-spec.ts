import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { AuthModule } from 'src/infra/modules/auth.module';
import { ServiceExecutionModule } from 'src/infra/modules/service-execution.module';
import { singUpAndLogin } from 'test/utils/helpers/sign-up-and-login.helper';
import { SignUpBodyDTO } from 'src/infra/schemas/sign-up.schemas';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/infra/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infra/guards/roles.guard';
import { CreatePlanBodyDTO } from 'src/infra/schemas/create-plan.schemas';
import { createSubscriptionHelper } from 'test/utils/helpers/create-subscription.helper';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import request from 'supertest';
import { serviceSeed } from 'test/utils/seeds/service.seed';
import { clientCompanySeed } from 'test/utils/seeds/client-company.seed';
import { CreateServiceExecutionBodyDTO } from 'src/infra/schemas/create-service-execution.schemas';
import { GlobalExceptionFilter } from 'src/infra/filters/global-exception.filter';

describe('ServiceExecution (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let token: string;

  let planData: CreatePlanBodyDTO;

  let dataToCreate: CreateServiceExecutionBodyDTO;
  let dataToCreate2: CreateServiceExecutionBodyDTO;
  let dataToCreate3: CreateServiceExecutionBodyDTO;

  const otherCompanyData: SignUpBodyDTO = {
    name: 'otherLuminnus',
    cnpj: `${randomUUID()}`,
    email: `${randomUUID()}@email.com`,
    password: '123456',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ServiceExecutionModule, AuthModule],
      providers: [
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
        { provide: APP_FILTER, useClass: GlobalExceptionFilter },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = moduleRef.get(PrismaService);
  });

  beforeEach(async () => {
    const companyData: SignUpBodyDTO = {
      name: 'Luminnus',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '123456',
    };

    const serviceData = {
      companyCnpj: companyData.cnpj,
      name: 'A service',
      description: 'A description',
      basePrice: Number((Math.random() * (10 + 410) + 10).toFixed(2)),
    };

    const clientCompanyData = {
      companyCnpj: companyData.cnpj,
      internationalId: `${randomUUID()}`,
      fullName: 'John Doe',
      email: 'email@email.com',
      phone: '12345678',
    };

    token = await singUpAndLogin(app, companyData);
    const { serviceId } = await serviceSeed(prisma, serviceData);
    const { clientCompanyId } = await clientCompanySeed(
      prisma,
      clientCompanyData,
    );

    planData = {
      name: `name_${randomUUID().slice(0, 25)}`, // No ZodSchema para criar, o limitede caracteres para o nome é 30
      type: 'MONTHLY',
      price: 129.99,
      servicesLimit: 12,
      serviceExecutionsLimit: 3,
      clientCompanysLimit: 12,
      invoicesLimit: 12,
    };

    await createSubscriptionHelper(app, prisma, token, planData);

    dataToCreate = {
      clientCompanyId,
      serviceId,
      executedAt: '2025-02-01',
    };

    dataToCreate2 = {
      clientCompanyId,
      serviceId,
      executedAt: '2025-04-03',
    };

    dataToCreate3 = {
      clientCompanyId,
      serviceId,
      executedAt: '2025-06-02',
    };
  });

  it('/service-execution (POST) - should create a ServiceExecution', async () => {
    const response = await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${token}`)
      .send(dataToCreate)
      .expect(201);

    expect(response.body).toHaveProperty('serviceExecutionId');
  });

  it('/service-execution (POST) - should return 404 when the Service not exists', async () => {
    const fakeId = '234567';

    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...dataToCreate, serviceId: fakeId })
      .expect(404);
  });

  it('/service-execution (POST) - should return 404 when the ClientCompany not exists', async () => {
    const fakeId = '234567';

    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...dataToCreate, clientCompanyId: fakeId })
      .expect(404);
  });

  it('/service-execution (POST) - should return 403 when the "User" companyId does not macth with Service companyId', async () => {
    // Esse login é necessário para a criação da company no banco de dados
    await singUpAndLogin(app, otherCompanyData);

    const { serviceId } = await serviceSeed(prisma, {
      companyCnpj: otherCompanyData.cnpj,
      name: 'otherName',
      description: 'otherDescription',
      basePrice: 99.99,
    });

    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...dataToCreate, serviceId: serviceId })
      .expect(403);
  });

  it('/service-execution (POST) - should return 403 when the "User" companyId does not macth with ClientCompany companyId', async () => {
    // Esse login é necessário para a criação da company no banco de dados
    await singUpAndLogin(app, otherCompanyData);

    const { clientCompanyId } = await clientCompanySeed(prisma, {
      companyCnpj: otherCompanyData.cnpj,
      internationalId: `${randomUUID()}`,
      fullName: 'Fulano',
      email: 'email@email.com',
      phone: '123455',
    });

    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...dataToCreate, clientCompanyId })
      .expect(403);
  });

  it('/service-execution (POST) - should return 403 when the "User" companyId does not match with Service and ClientCompanyId', async () => {
    const otherTokenCompany = await singUpAndLogin(app, otherCompanyData);
    await createSubscriptionHelper(app, prisma, otherTokenCompany, planData);

    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${otherTokenCompany}`)
      .send(dataToCreate)
      .expect(403);
  });

  it('/service-execution (POST) - should return 403 when the company reached subcription service executions limit', async () => {
    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${token}`)
      .send(dataToCreate)
      .expect(201);

    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${token}`)
      .send(dataToCreate2)
      .expect(201);

    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${token}`)
      .send(dataToCreate3)
      .expect(201);

    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${token}`)
      .send(dataToCreate)
      .expect(403);
  });

  it('/service-execution (POST) - should return 403 when the have not an active subscripion', async () => {
    const otherTokenCompany = await singUpAndLogin(app, {
      name: 'Lumin',
      email: `${randomUUID()}@email.com`,
      cnpj: `${randomUUID()}`,
      password: '123456',
    });

    await request(app.getHttpServer())
      .post('/service-execution')
      .set('Authorization', `Bearer ${otherTokenCompany}`)
      .send(dataToCreate)
      .expect(403);
  });
});
