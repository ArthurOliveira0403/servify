/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { JwtAuthGuard } from 'src/infra/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infra/guards/roles.guard';
import { AuthModule } from 'src/infra/modules/auth.module';
import { DatabaseModule } from 'src/infra/modules/database.module';
import { SubscriptionModule } from 'src/infra/modules/subscription.module';
import { CreatePlanBodyDTO } from 'src/infra/schemas/create-plan.schemas';
import { SignUpBodyDTO } from 'src/infra/schemas/sign-up.schemas';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import { singUpAndLogin } from 'test/utils/helpers/sign-up-and-login.helper';
import request from 'supertest';
import { planSeed } from 'test/utils/seeds/plan.seed';
import { GlobalExceptionFilter } from 'src/infra/filters/global-exception.filter';

describe('Subscription (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  let dataPlan: CreatePlanBodyDTO;
  let planId: string;

  let token: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SubscriptionModule, AuthModule, DatabaseModule],
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
    app.getHttpAdapter().getInstance().ready();

    prisma = moduleRef.get(PrismaService);
  });

  beforeEach(async () => {
    dataPlan = {
      name: `name_${randomUUID().slice(0, 25)}`, // No ZodSchema para criar, o limitede caracteres para o nome é 30
      type: 'MONTHLY',
      price: 199.99,
      servicesLimit: 15,
      serviceExecutionsLimit: 15,
      clientCompanysLimit: 15,
      invoicesLimit: 15,
    };

    const response = await planSeed(prisma, dataPlan);
    planId = response.planId;

    const companyData: SignUpBodyDTO = {
      name: 'Luminnus',
      cnpj: `${randomUUID()}`,
      email: `${randomUUID()}@email.com`,
      password: '123456787654321',
    };

    const { accessToken } = await singUpAndLogin(app, companyData);
    token = accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // ==================== Create ====================
  it('/subscription/:planId (POST) - should create a subscription', async () => {
    const response = await request(app.getHttpServer())
      .post(`/subscription/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body.message).toBe('Subscription succesfully created');
    expect(response.body).toHaveProperty('subscriptionId');
  });

  it('/subscription/:planId (POST) - should return 409 when already exist an active subscrition', async () => {
    await request(app.getHttpServer())
      .post(`/subscription/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/subscription/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);
  });

  // ==================== List Active ====================
  it('/subscription (GET) - should return an active subscription of company', async () => {
    await request(app.getHttpServer())
      .post(`/subscription/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/subscription')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('subscription');
  });

  it('/subscription (GET) - should return null when the company not have active subscription', async () => {
    const response = await request(app.getHttpServer())
      .get('/subscription')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.subscription).toBe(null);
  });

  // ==================== Cancel ====================
  it('/subscription/:id (DELETE) - should return cancel a subscription', async () => {
    const response = await request(app.getHttpServer())
      .post(`/subscription/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const subscriptionId = response.body.subscriptionId;

    const responseCancel = await request(app.getHttpServer())
      .delete(`/subscription/${subscriptionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(responseCancel.body.message).toBe(
      'Successfully subscription canceled',
    );
  });

  it('/subscription/:id (DELETE) - should return return 404 when the subscription not exist', async () => {
    const fakeSubscriptionId = '1234567';

    await request(app.getHttpServer())
      .delete(`/subscription/${fakeSubscriptionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('/subscription/:id (DELETE) - should return return 403 when the subscription not belong to the company', async () => {
    const { accessToken } = await singUpAndLogin(app, {
      name: 'otherName',
      cnpj: 'otherCnpj',
      email: 'otherCompany@email.com',
      password: '13245643',
    });

    const response = await request(app.getHttpServer())
      .post(`/subscription/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const subscriptionId = response.body.subscriptionId;

    await request(app.getHttpServer())
      .delete(`/subscription/${subscriptionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
