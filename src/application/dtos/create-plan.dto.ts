import { PlanType } from '../../domain/entities/plan';

export abstract class CreatePlanDTO {
  name: string;
  type: PlanType;
  price: number;
  servicesLimit: number;
  serviceExecutionsLimit: number;
  clientCompanysLimit: number;
  invoicesLimit: number;
}
