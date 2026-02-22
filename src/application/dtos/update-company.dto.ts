export abstract class UpdateCompanyDTO {
  companyId: string;
  name?: string;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    street?: string;
    number?: string;
    zipCode?: string;
    complement?: string;
  };
  phoneNumber?: string;
}
