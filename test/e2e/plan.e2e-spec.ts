/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { SignInAdminBodyDTO } from 'src/infra/schemas/sign-in-admin.schemas';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import { singInAdmin } from 'test/utils/helpers/sing-in-admin.helper';
import request from 'supertest';
import { CreatePlanBodyDTO } from 'src/infra/schemas/create-plan.schemas';
import { SignUpBodyDTO } from 'src/infra/schemas/sign-up.schemas';
import { singUpAndLogin } from 'test/utils/helpers/sign-up-and-login.helper';
import { UpdatePlanBodyDTO } from 'src/infra/schemas/update-plan.schemas';
import { PlanModule } from 'src/infra/modules/plan.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/infra/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infra/guards/roles.guard';
import { ValidateUserModule } from 'src/infra/modules/validate-user.module';
import { AdminAuthModule } from 'src/infra/modules/admin-auth.module';
import { AuthModule } from 'src/infra/modules/auth.module';

describe('Plan (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let token: string;

  const companyData: SignUpBodyDTO = {
    name: 'Luminnus',
    cnpj: '12345678234567890876543',
    email: `${randomUUID()}@email.com`,
    password: '2345678',
  };

  let adminData: SignInAdminBodyDTO;
  let dataToCreate: CreatePlanBodyDTO;
  let dataToCreate2: CreatePlanBodyDTO;
  let dataToCreate3: CreatePlanBodyDTO;

  const dataToUpdate: UpdatePlanBodyDTO = {
    name: `name_${randomUUID().slice(0, 25)}`,
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PlanModule, ValidateUserModule, AdminAuthModule, AuthModule],
      providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
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
    adminData = {
      email: `${randomUUID()}@email.com`,
      password: '1232456',
    };

    token = await singInAdmin(app, prisma, adminData);

    dataToCreate = {
      name: `name_${randomUUID().slice(0, 25)}`, // No ZodSchema para criar, o limitede caracteres para o nome é 30
      type: 'MONTHLY',
      price: 199.99,
      servicesLimit: 15,
      serviceExecutionsLimit: 15,
      clientCompanysLimit: 15,
      invoicesLimit: 15,
    };

    dataToCreate2 = {
      name: `name_${randomUUID().slice(0, 25)}`, // No ZodSchema para criar, o limitede caracteres para o nome é 30
      type: 'YEARLY',
      price: 1299.99,
      servicesLimit: 40,
      serviceExecutionsLimit: 40,
      clientCompanysLimit: 40,
      invoicesLimit: 40,
    };

    dataToCreate3 = {
      name: `name_${randomUUID().slice(0, 25)}`, // No ZodSchema para criar, o limitede caracteres para o nome é 30
      type: 'YEARLY',
      price: 3999.99,
      servicesLimit: 500,
      serviceExecutionsLimit: 500,
      clientCompanysLimit: 500,
      invoicesLimit: 500,
    };
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  // ==================== Create ====================
  it('/plan (POST) - should create a plan', async () => {
    const response = await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body).toHaveProperty('planId');
  });

  // Corrigir após FilterExceptions
  it('/plan (POST) - should return 500 when try create a already exist plan with this name', async () => {
    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(500);
  });

  it('/plan (POST) - should return 403 statuCode when some company try create a plan', async () => {
    const companyToken = await singUpAndLogin(app, companyData);

    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${companyToken}`)
      .expect(403);
  });

  // ==================== List One ====================
  it('/plan/:id (GET) - should list one plan', async () => {
    const response = await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const planId = response.body.planId;

    const getResponse = await request(app.getHttpServer())
      .get(`/plan/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getResponse.body).toHaveProperty('plan');
  });

  // Corrigir após FilterExceptions
  it('/plan/:id (GET) - should return 500 when the plan not exist', async () => {
    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const fakePlanId = '123';

    await request(app.getHttpServer())
      .get(`/plan/${fakePlanId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(500);
  });

  it('/plan/:id (GET) - should return 403 statuCode when some company try list one plan', async () => {
    const companyToken = await singUpAndLogin(app, companyData);

    const response = await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const planId = response.body.planId;

    await request(app.getHttpServer())
      .get(`/plan/${planId}`)
      .set('Authorization', `Bearer ${companyToken}`)
      .expect(403);
  });

  // ==================== List All ====================
  it('/plan (GET) - should list one plan', async () => {
    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate2)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate3)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const getResponse = await request(app.getHttpServer())
      .get('/plan')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getResponse.body).toHaveProperty('plans');
  });

  it('/plan (GET) - should return 403 statuCode when some company try list all plans', async () => {
    const companyToken = await singUpAndLogin(app, companyData);

    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate2)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate3)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .get('/plan')
      .set('Authorization', `Bearer ${companyToken}`)
      .expect(403);
  });

  // ==================== Update ====================
  it('/plan/:id (PATCH) - should update a plan', async () => {
    const response = await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const planId = response.body.planId;

    const responseUpdate = await request(app.getHttpServer())
      .patch(`/plan/${planId}`)
      .send(dataToUpdate)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(responseUpdate.body.plan).toMatchObject({
      name: dataToUpdate.name,
    });
  });

  // Corrigi após FilterExceptions
  it('/plan/:id (PATCH) - should return 500 when the plan not exist', async () => {
    const fakePlanId = '1234567865432134567865433';

    await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/plan/${fakePlanId}`)
      .send(dataToUpdate)
      .set('Authorization', `Bearer ${token}`)
      .expect(500);
  });

  it('/plan/:id (PATCH) - should return 403 when some company try update a plan', async () => {
    const companyToken = await singUpAndLogin(app, companyData);

    const response = await request(app.getHttpServer())
      .post('/plan')
      .send(dataToCreate)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const planId = response.body.planId;

    await request(app.getHttpServer())
      .patch(`/plan/${planId}`)
      .send(dataToUpdate)
      .set('Authorization', `Bearer ${companyToken}`)
      .expect(403);
  });
});
