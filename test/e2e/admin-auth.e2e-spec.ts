import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { AdminAuthModule } from 'src/infra/modules/admin-auth.module';
import { SignInAdminBodyDTO } from 'src/infra/schemas/sign-in-admin.schemas';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import request from 'supertest';
import { adminSeed } from 'test/utils/seeds/admin.seed';

describe('AdminAuth (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  let adminCreateData: SignInAdminBodyDTO;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AdminAuthModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = moduleRef.get(PrismaService);
  });

  beforeEach(async () => {
    adminCreateData = {
      email: `${randomUUID()}@email.com`,
      password: '123456',
    };
    await adminSeed(prisma, adminCreateData);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('should login admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/s_admin/auth')
      .send(adminCreateData)
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
  });

  // Corrigir quando colocar o  filterException
  it('should return status 500 when send incorrect email', async () => {
    await request(app.getHttpServer())
      .post('/s_admin/auth')
      .send({ ...adminCreateData, email: 'fakeEmail@email.com' })
      .expect(500);
  });

  it('should return status 500 when send incorrect password', async () => {
    await request(app.getHttpServer())
      .post('/s_admin/auth')
      .send({ ...adminCreateData, password: 'fakePassword' })
      .expect(500);
  });
});
