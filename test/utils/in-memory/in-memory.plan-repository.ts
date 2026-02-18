/* eslint-disable @typescript-eslint/await-thenable */
import { Plan } from 'src/domain/entities/plan';
import { PlanRepository } from 'src/domain/repositories/plan.repository';

export class InMemoryPlanRepository implements PlanRepository {
  plan: Plan[] = [];

  async save(plan: Plan): Promise<void> {
    await this.plan.push(plan);
  }

  async findById(id: string): Promise<Plan | null> {
    const plan = await this.plan.find((p) => p.id === id);

    return plan ?? null;
  }

  async findByName(name: string): Promise<Plan | null> {
    const plan = await this.plan.find((p) => p.name === name);

    return plan ?? null;
  }

  async findAll(): Promise<Plan[] | []> {
    const plans = await this.plan;

    return plans ?? [];
  }

  async update(plan: Plan): Promise<void> {
    const index = await this.plan.findIndex((p) => p.id === plan.id);
    if (index === -1) throw new Error('Plan not found');

    this.plan[index] = plan;
  }
}
