import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  CLIENT_COMPANY_REPOSITORY,
  type ClientCompanyRepository,
} from 'src/domain/repositories/client-company.repository';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
} from 'src/domain/repositories/client.repository';
import { CreateClientCompanyDTO } from '../dtos/create-client-company.dto';
import { ClientCompany } from 'src/domain/entities/client-company';
import { Client } from 'src/domain/entities/client';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { Feature } from 'src/domain/entities/subscription';
import {
  SUBSCRIPTION_POLICY_SERVICE,
  type ISubscriptionPolicyService,
} from '../services/isubcription-policy.service';

@Injectable()
export class CreateClientCompanyUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private clientRepository: ClientRepository,
    @Inject(CLIENT_COMPANY_REPOSITORY)
    private clientCompanyRepository: ClientCompanyRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
    @Inject(SUBSCRIPTION_POLICY_SERVICE)
    private subscriptionPolicyService: ISubscriptionPolicyService,
  ) {}

  async handle(
    data: CreateClientCompanyDTO,
  ): Promise<{ clientCompanyId: string }> {
    await this.subscriptionPolicyService.handle(
      data.companyId,
      Feature.CLIENT_COMPANY,
    );

    const clientId = await this.verifyClientExists(
      data.fullName,
      data.internationalId,
    );

    const relationExists = await this.clientCompanyRepository.findRelation(
      data.companyId,
      clientId,
    );

    if (relationExists)
      throw new ConflictException(
        'The relation between the company and the client it already exists',
      );

    const clientCompany = new ClientCompany({
      clientId: clientId,
      companyId: data.companyId,
      email: data.email ?? undefined,
      phone: data.phone ?? undefined,
      createdAt: this.dateTransformService.nowUTC(),
      updatedAt: this.dateTransformService.nowUTC(),
    });

    await this.clientCompanyRepository.save(clientCompany);

    const clientCompanyId = clientCompany.id;

    return { clientCompanyId };
  }

  private async verifyClientExists(fullName: string, internationalId: string) {
    const client =
      await this.clientRepository.findByInternationalId(internationalId);

    if (!client) return await this.createClient(fullName, internationalId);

    return client.id;
  }

  private async createClient(
    fullName: string,
    internationalId: string,
  ): Promise<string> {
    const client = new Client({
      fullName,
      internationalId,
      createdAt: this.dateTransformService.nowUTC(),
    });

    await this.clientRepository.save(client);

    return client.id;
  }
}
