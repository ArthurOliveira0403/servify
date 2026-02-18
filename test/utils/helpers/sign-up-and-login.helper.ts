/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import { SignUpBodyDTO } from 'src/infra/schemas/sign-up.schemas';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export async function singUpAndLogin(
  app: NestFastifyApplication,
  data: SignUpBodyDTO,
): Promise<string> {
  await request(app.getHttpServer()).post('/auth/signup').send(data);
  const response = await request(app.getHttpServer())
    .post('/auth/signin')
    .send({ email: data.email, password: data.password });

  return response.body.accessToken as string;
}
