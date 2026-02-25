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
import { CompanyModule } from 'src/infra/modules/company.module';
import { SignUpBodyDTO } from 'src/infra/schemas/sign-up.schemas';
import request from 'supertest';
import { singUpAndLogin } from 'test/utils/helpers/sign-up-and-login.helper';

describe('Company (e2e)', () => {
  let app: NestFastifyApplication;

  const companyData: SignUpBodyDTO = {
    name: 'Lumin',
    cnpj: `${randomUUID()}`,
    email: `${randomUUID().replace(/-/g, '_')}@email.com`,
    password: '123456',
  };

  const data = {
    phoneNumber: '0201831890',
    address: {
      country: 'Brazil',
      state: 'Rio de Janeiro',
      city: 'Rio de Janeiro',
    },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CompanyModule, AuthModule],
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('/company (PATCH) - should update a company', async () => {
    const { accessToken } = await singUpAndLogin(app, companyData);

    const response = await request(app.getHttpServer())
      .patch('/company')
      .send(data)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Timezone', 'America/Brasilia')
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Company successfully updated',
    });
    expect(response.body).toHaveProperty('company');
  });

  it('/company (PATCH) - should return 401 when token is invalid', async () => {
    await singUpAndLogin(app, companyData);

    await request(app.getHttpServer())
      .patch('/company')
      .send(data)
      .set('Authorization', `Bearer invalid_token`)
      .set('Timezone', 'America/Brasilia')
      .expect(401);
  });
});
