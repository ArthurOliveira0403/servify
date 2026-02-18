import { Plan } from '../entities/plan';

export const PLAN_REPOSITORY = 'PLAN_REPOSITORY';

export interface PlanRepository {
  save(plan: Plan): Promise<void>;
  findById(id: string): Promise<Plan | null>;
  findByName(name: string): Promise<Plan | null>;
  findAll(): Promise<Plan[] | []>;
  update(plan: Plan): Promise<void>;
}
