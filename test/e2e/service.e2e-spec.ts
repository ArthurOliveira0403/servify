/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { APP_GUARD } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { JwtAuthGuard } from 'src/infra/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infra/guards/roles.guard';
import { AuthModule } from 'src/infra/modules/auth.module';
import { ServiceModule } from 'src/infra/modules/service.module';
import { CreatePlanBodyDTO } from 'src/infra/schemas/create-plan.schemas';
import { CreateServiceBodyDTO } from 'src/infra/schemas/create-service.schemas';
import { SignUpBodyDTO } from 'src/infra/schemas/sign-up.schemas';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import { createSubscriptionHelper } from 'test/utils/helpers/create-subscription.helper';
import { singUpAndLogin } from 'test/utils/helpers/sign-up-and-login.helper';
import request from 'supertest';
import { UpdateServiceBodyDTO } from 'src/infra/schemas/update-service.schemas';

describe('Service (e2e)', () => {
  let app: NestFastifyApplication;
  let companyData: SignUpBodyDTO;
  let planData: CreatePlanBodyDTO;
  let serviceData: CreateServiceBodyDTO;
  let prisma: PrismaService;
  let token: string;

  const updateData: UpdateServiceBodyDTO = {
    name: 'NewName',
    description: 'NewDescription',
    basePrice: 299.99,
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ServiceModule, AuthModule],
      providers: [
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
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
    companyData = {
      name: 'Luminnus',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '123245678',
    };

    token = await singUpAndLogin(app, companyData);

    planData = {
      name: `name_${randomUUID().slice(0, 25)}`, // No ZodSchema para criar, o limitede caracteres para o nome é 30
      type: 'MONTHLY',
      price: 129.99,
      servicesLimit: 3,
      serviceExecutionsLimit: 12,
      clientCompanysLimit: 12,
      invoicesLimit: 12,
    };

    await createSubscriptionHelper(app, prisma, token, planData);

    serviceData = {
      name: `Service name_${randomUUID()}`,
      description: 'A description',
      basePrice: Number((Math.random() * (10 + 500) + 10).toFixed(2)), // Pode causar erros de precisão no arredondamento
    };
  });

  afterAll(async () => {
    await app.close();
  });

  // ==================== Create Service ====================
  it('/service (POST) - should create a service', async () => {
    const response = await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Service successfully created',
    });
    expect(response.body).toHaveProperty('serviceId');
  });

  it('/service (POST) - shoudl return 500 when the company have reached the subscription services limit', async () => {
    await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(201);

    await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(201);

    await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(201);

    await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(500);
  });

  // Corrigir após FilterException
  it('/service (POST) - should return 403 when the company have not subscription', async () => {
    const otherCompanyToken = await singUpAndLogin(app, {
      name: 'otherCompany',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '12344',
    });

    await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${otherCompanyToken}`)
      .send(serviceData)
      .expect(403);
  });

  // ==================== List all of the Company ====================
  it('/service (GET) - should list all services of the company', async () => {
    await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/service')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toMatchObject({ ...serviceData });
  });

  it('/service (GET) - should return [] when the company have not Services', async () => {
    const response = await request(app.getHttpServer())
      .get('/service')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('/service (GET) - should return 403 when the company have not subscription', async () => {
    const otherCompanyToken = await singUpAndLogin(app, {
      name: 'otherCompany',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '12344',
    });

    await request(app.getHttpServer())
      .get('/service')
      .set('Authorization', `Bearer ${otherCompanyToken}`)
      .expect(403);
  });

  // ==================== Update Service ====================
  it('/service/:id (PATCH) - should update a Service', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(201);

    const serviceId = createResponse.body.serviceId;

    const response = await request(app.getHttpServer())
      .patch(`/service/${serviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Successfully service updated',
    });
    expect(response.body).toHaveProperty('service');
  });

  it('/service/:id (PATCH) - should return 404 when the service does not exists', async () => {
    const fakeServiceId = '12345678';

    await request(app.getHttpServer())
      .patch(`/service/${fakeServiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData)
      .expect(404);
  });

  it('/service/:id (PATCH) - should return 403 when the service not belong to the Company', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(201);

    const serviceId = createResponse.body.serviceId;

    const otherToken = await singUpAndLogin(app, {
      name: 'Lumi',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '1234',
    });

    await createSubscriptionHelper(app, prisma, otherToken, planData);

    await request(app.getHttpServer())
      .patch(`/service/${serviceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send(updateData)
      .expect(403);
  });

  it('/service/:id (PATCH) - should return 403 when the company have not an active subscription', async () => {
    const simuledServiceId = '1234567';

    const otherToken = await singUpAndLogin(app, {
      name: 'Lumi',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '1234',
    });

    await request(app.getHttpServer())
      .patch(`/service/${simuledServiceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send(updateData)
      .expect(403);
  });

  // ==================== Delete Service ====================
  it('/service/:id (DELETE) - should delete a Service', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(201);

    const serviceId = createResponse.body.serviceId;

    const response = await request(app.getHttpServer())
      .delete(`/service/${serviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Successfully service deleted',
    });
  });

  it('/service/:id (DELETE) - should return 404 when the service does not exists', async () => {
    const fakeServiceId = '12345678';

    await request(app.getHttpServer())
      .delete(`/service/${fakeServiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('/service/:id (DELETE) - should return 403 when the service not belong to the company', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/service')
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData)
      .expect(201);

    const serviceId = createResponse.body.serviceId;

    const otherToken = await singUpAndLogin(app, {
      name: 'Lumi',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '1234',
    });

    await request(app.getHttpServer())
      .delete(`/service/${serviceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });

  it('/service/:id (DELETE) - should return 403 when the company have not subscription', async () => {
    const simuledServiceId = '234567';

    const otherToken = await singUpAndLogin(app, {
      name: 'Lumi',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '1234',
    });

    await request(app.getHttpServer())
      .delete(`/service/${simuledServiceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send(updateData)
      .expect(403);
  });
});
