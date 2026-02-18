import { PlanType } from '../../domain/entities/plan';

export abstract class UpdatePlanDTO {
  planId: string;
  name?: string;
  type?: PlanType;
  price?: number;
  description?: string;
}
