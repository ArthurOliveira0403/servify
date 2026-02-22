/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { singUpAndLogin } from 'test/utils/helpers/sign-up-and-login.helper';
import { randomUUID } from 'node:crypto';
import { ClientCompanyModule } from 'src/infra/modules/client-company.module';
import { AuthModule } from 'src/infra/modules/auth.module';
import { SignUpBodyDTO } from 'src/infra/schemas/sign-up.schemas';
import { CreateClientCompanyBodyDTO } from 'src/infra/schemas/create-client-company.schemas';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/infra/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infra/guards/roles.guard';
import { CreatePlanBodyDTO } from 'src/infra/schemas/create-plan.schemas';
import { createSubscriptionHelper } from 'test/utils/helpers/create-subscription.helper';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import { GlobalExceptionFilter } from 'src/infra/filters/global-exception.filter';

describe('ClientCompany (e2e)', () => {
  let app: NestFastifyApplication;
  let companyData: SignUpBodyDTO;
  let planData: CreatePlanBodyDTO;
  let prisma: PrismaService;
  let token: string;

  let dataToCreate: CreateClientCompanyBodyDTO;
  let dataToCreate2: CreateClientCompanyBodyDTO;
  let dataToCreate3: CreateClientCompanyBodyDTO;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ClientCompanyModule, AuthModule],
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
    dataToCreate = {
      fullName: 'John Doe',
      internationalId: `${randomUUID()}`,
      email: 'email@email.com',
      phone: '1234567890',
    };

    dataToCreate2 = {
      fullName: 'John Doe',
      internationalId: `${randomUUID()}`,
      email: 'email@email.com',
      phone: '1234567890',
    };

    dataToCreate3 = {
      fullName: 'John Doe',
      internationalId: `${randomUUID()}`,
      email: 'email@email.com',
      phone: '1234567890',
    };

    companyData = {
      name: 'Test Company',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID().replace(/-/g, '')}@email.com`,
      password: 'strongPassword123',
    };

    token = await singUpAndLogin(app, companyData);

    planData = {
      name: `name_${randomUUID().slice(0, 25)}`, // No ZodSchema para criar, o limitede caracteres para o nome é 30
      type: 'MONTHLY',
      price: 129.99,
      servicesLimit: 12,
      serviceExecutionsLimit: 12,
      clientCompanysLimit: 3,
      invoicesLimit: 12,
    };

    await createSubscriptionHelper(app, prisma, token, planData);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  // ==================== Create ====================
  it('/client-company (POST) - should create a new client company', async () => {
    const response = await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...dataToCreate,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Client Company successfully created',
    });
    expect(response.body).toHaveProperty('clientCompanyId');
  });

  it('/client-company (POST) - should throw ConflictException when the client company already exists', async () => {
    await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...dataToCreate,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...dataToCreate,
      })
      .expect(409);
  });

  it('/client-company (POST) - should return 403 when the company have not an active subscription', async () => {
    const otherToken = await singUpAndLogin(app, {
      name: 'otherCompany',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '12344',
    });

    await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        ...dataToCreate,
      })
      .expect(403);
  });

  it('/client-company (POST) - should return 403 when the company reached the subscription clients company limit', async () => {
    await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send(dataToCreate)
      .expect(201);

    await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send(dataToCreate2)
      .expect(201);

    await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send(dataToCreate3)
      .expect(201);

    await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...dataToCreate, internationalId: `${randomUUID()}` })
      .expect(403);
  });

  // ==================== Find All ====================
  it('/client-company (GET) - should return a list of client companies', async () => {
    await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...dataToCreate,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toMatchObject({
      fullName: dataToCreate.fullName,
      internationalId: dataToCreate.internationalId,
      email: dataToCreate.email,
      phone: dataToCreate.phone,
    });
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('clientId');
  });

  it('/client-company (GET) - should return 403 when the company have not an active subscription', async () => {
    const otherToken = await singUpAndLogin(app, {
      name: 'otherCompany',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '12344',
    });

    await request(app.getHttpServer())
      .get('/client-company')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });

  // ==================== Find One ====================
  it('/client-company/:id (GET) - should return one client companie', async () => {
    const responseCreate = await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...dataToCreate,
      })
      .expect(201);

    const clientCompanyId = responseCreate.body.clientCompanyId;

    const response = await request(app.getHttpServer())
      .get(`/client-company/${clientCompanyId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      fullName: dataToCreate.fullName,
      internationalId: dataToCreate.internationalId,
      email: dataToCreate.email,
      phone: dataToCreate.phone,
    });
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('clientId');
  });

  it('/client-company/:id (GET) - should return 403 when the company have not an active subscription', async () => {
    const simuledClientCompanyId = '123456';

    const otherToken = await singUpAndLogin(app, {
      name: 'otherCompany',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '12344',
    });

    await request(app.getHttpServer())
      .get(`/client-company/${simuledClientCompanyId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });

  // ==================== Update ====================
  it('/client-company/:id (PATCH) - should update an existing client company', async () => {
    const responseCreate = await request(app.getHttpServer())
      .post('/client-company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...dataToCreate,
      })
      .expect(201);

    const dataToUpdate = { email: 'newemail@email.com', phone: '12345678' };

    const response = await request(app.getHttpServer())
      .patch(`/client-company/${responseCreate.body.clientCompanyId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dataToUpdate)
      .expect(200);

    expect(response.body.message).toBe('Client Company successfully updated');
    expect(response.body.clientCompany).toMatchObject({
      fullName: dataToCreate.fullName,
      internationalId: dataToCreate.internationalId,
      email: dataToUpdate.email,
      phone: dataToUpdate.phone,
    });
    expect(response.body.clientCompany).toHaveProperty('id');
    expect(response.body.clientCompany).toHaveProperty('clientId');
  });

  it('/client-company/:id (PATCH) - should throw NotFoundException when trying to update a non-existing client company', async () => {
    const nonExistingClientCompanyId = randomUUID();

    await request(app.getHttpServer())
      .patch(`/client-company/${nonExistingClientCompanyId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'email@email.com', phone: '1234567' })
      .expect(404);
  });

  it('/client-company/:id (PATCH) - should return 403 when the company have not an active subscription', async () => {
    const simuledClientCompanyId = '123456';

    const otherToken = await singUpAndLogin(app, {
      name: 'otherCompany',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '12344',
    });

    await request(app.getHttpServer())
      .patch(`/client-company/${simuledClientCompanyId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });
});
