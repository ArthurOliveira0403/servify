import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { CreatePlanBodyDTO } from 'src/infra/schemas/create-plan.schemas';
import { planSeed } from '../seeds/plan.seed';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import request from 'supertest';

export async function createSubscriptionHelper(
  app: NestFastifyApplication,
  prisma: PrismaService,
  token: string,
  planData: CreatePlanBodyDTO,
): Promise<void> {
  const plan = await prisma.plan.findUnique({ where: { name: planData.name } });

  if (!plan) {
    const { planId } = await planSeed(prisma, planData);

    await request(app.getHttpServer())
      .post(`/subscription/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    return;
  }

  await request(app.getHttpServer())
    .post(`/subscription/${plan.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(201);

  return;
}
