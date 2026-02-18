import { CreatePlanDTO } from 'src/application/dtos/create-plan.dto';
import { Plan } from 'src/domain/entities/plan';
import { PrismaPlanMapper } from 'src/infra/services/prisma/mappers/prisma-plan.mapper';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';

export async function planSeed(
  prisma: PrismaService,
  data: CreatePlanDTO,
): Promise<{ planId: string }> {
  try {
    const plan = new Plan({
      ...data,
    });

    const raw = PrismaPlanMapper.toPrisma(plan);

    await prisma.plan.create({
      data: raw,
    });

    return { planId: plan.id };
  } catch (error) {
    throw new Error(`Error in planSeed ${error}`);
  }
}
