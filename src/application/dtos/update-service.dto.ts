export abstract class UpdateServiceDTO {
  companyId: string;
  serviceId: string;
  name?: string;
  description?: string;
  basePrice?: number;
}
