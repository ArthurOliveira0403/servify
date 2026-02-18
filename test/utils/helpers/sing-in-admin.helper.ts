/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { SignInAdminBodyDTO } from 'src/infra/schemas/sign-in-admin.schemas';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import { adminSeed } from '../seeds/admin.seed';

export async function singInAdmin(
  app: NestFastifyApplication,
  prisma: PrismaService,
  data: SignInAdminBodyDTO,
): Promise<string> {
  await adminSeed(prisma, data);

  const response = await request(app.getHttpServer())
    .post('/s_admin/auth')
    .send({ email: data.email, password: data.password });

  return response.body.accessToken as string;
}
