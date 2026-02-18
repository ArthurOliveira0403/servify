import { PrismaService } from '../../prisma/prisma.service';
import { PlanRepository } from 'src/domain/repositories/plan.repository';
import { Injectable } from '@nestjs/common';
import { Plan } from 'src/domain/entities/plan';
import { PrismaPlanMapper } from '../mappers/prisma-plan.mapper';

@Injectable()
export class PrismaPlanRepository implements PlanRepository {
  constructor(private prisma: PrismaService) {}

  async save(plan: Plan): Promise<void> {
    const row = PrismaPlanMapper.toPrisma(plan);

    await this.prisma.plan.create({
      data: { ...row },
    });
  }

  async findAll(): Promise<Plan[] | []> {
    const plans = await this.prisma.plan.findMany();

    if (!plans) return [];

    const plansFound = plans.map((p) => PrismaPlanMapper.toDomain(p));

    return plansFound;
  }

  async findByName(name: string): Promise<Plan | null> {
    const plan = await this.prisma.plan.findUnique({ where: { name } });

    if (!plan) return null;

    return PrismaPlanMapper.toDomain(plan);
  }

  async findById(id: string): Promise<Plan | null> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) return null;

    const planFound = PrismaPlanMapper.toDomain(plan);

    return planFound;
  }

  async update(plan: Plan): Promise<void> {
    const row = PrismaPlanMapper.toPrisma(plan);

    await this.prisma.plan.update({
      where: { id: plan.id },
      data: { ...row },
    });
  }
}
