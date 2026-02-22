import { Inject, Injectable } from '@nestjs/common';
import {
  INVOICE_REPOSITORY,
  type InvoiceRepository,
} from 'src/domain/repositories/invoice.repository';
import {
  SERVICE_EXECUTION_REPOSITORY,
  type ServiceExecutionRepository,
} from 'src/domain/repositories/service-execution.repository';
import { Invoice } from 'src/domain/entities/invoice';
import { IssueInvoiceDTO } from '../dtos/issue-invoice.dto';
import {
  CLIENT_COMPANY_REPOSITORY,
  type ClientCompanyRepository,
} from 'src/domain/repositories/client-company.repository';
import {
  CLIENT_REPOSITORY,
  type ClientRepository,
} from 'src/domain/repositories/client.repository';
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from 'src/domain/repositories/company.repository';
import {
  SERVICE_REPOSITORY,
  type ServiceRespository,
} from 'src/domain/repositories/service.repository';
import {
  DATE_TRANSFORM_SERVICE,
  type DateTransformService,
} from '../services/date-transform.service';
import { Feature } from 'src/domain/entities/subscription';
import {
  SUBSCRIPTION_POLICY_SERVICE,
  type ISubscriptionPolicyService,
} from '../services/isubcription-policy.service';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { NonBelongingException } from '../exceptions/non-belonging.exception';
import { AlreadyExistException } from '../exceptions/already-exist.exception';

@Injectable()
export class IssueInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private invoiceRepository: InvoiceRepository,
    @Inject(SERVICE_EXECUTION_REPOSITORY)
    private serviceExecutionRepository: ServiceExecutionRepository,
    @Inject(SERVICE_REPOSITORY)
    private serviceRepository: ServiceRespository,
    @Inject(CLIENT_COMPANY_REPOSITORY)
    private clientCompanyRepository: ClientCompanyRepository,
    @Inject(CLIENT_REPOSITORY)
    private clientRepository: ClientRepository,
    @Inject(COMPANY_REPOSITORY)
    private companyRepository: CompanyRepository,
    @Inject(DATE_TRANSFORM_SERVICE)
    private dateTransformService: DateTransformService,
    @Inject(SUBSCRIPTION_POLICY_SERVICE)
    private subscriptionPolicyService: ISubscriptionPolicyService,
  ) {}

  async handle(data: IssueInvoiceDTO): Promise<{ invoiceId: string }> {
    await this.subscriptionPolicyService.handle(
      data.companyId,
      Feature.INVOICE,
    );

    const company = await this.companyRepository.findById(data.companyId);
    if (!company)
      throw new EntityNotFoundException(
        `The Company of id: ${data.companyId} not found`,
        'Company Not Found',
        IssueInvoiceUseCase.name,
      );

    const execution = await this.serviceExecutionRepository.findById(
      data.serviceExecutionId,
    );
    if (!execution)
      throw new EntityNotFoundException(
        `The Service execution of id: ${data.serviceExecutionId} not found`,
        'Service execution not found',
        IssueInvoiceUseCase.name,
      );

    if (company.id !== execution.companyId)
      throw new NonBelongingException(
        `The Service Execution of id: ${data.serviceExecutionId} does not belong to the Company of id: ${data.companyId}`,
        'The Service Execution do not belong to the Company',
        IssueInvoiceUseCase.name,
      );

    const service = await this.serviceRepository.findById(execution.serviceId);

    const clientCompany = await this.clientCompanyRepository.findById(
      execution.clientCompanyId,
    );
    const client = await this.clientRepository.findById(
      clientCompany!.clientId,
    );

    const invoiceIssued =
      await this.invoiceRepository.findIssuedByServiceExecution(
        data.serviceExecutionId,
      );
    if (invoiceIssued)
      throw new AlreadyExistException(
        `Invoice already exists for Service Execution of id: ${data.serviceExecutionId}`,
        'Invoice already exists for this execution',
        IssueInvoiceUseCase.name,
      );

    const invoice = new Invoice({
      companyId: data.companyId,
      companyName: company.name,
      companyCnpj: company.cnpj,
      companyPhone: company.phoneNumber ?? undefined,
      clientInternationalId: client!.internationalId,
      clientName: client!.fullName,
      clientPhone: clientCompany!.phone ?? undefined,
      serviceExecutionId: data.serviceExecutionId,
      serviceName: service!.name,
      serviceDescription: service!.description,
      executedAt: execution.executedAt,
      price: execution.price,
      issuedAt: this.dateTransformService.nowUTC(),
      invoiceNumber: this.generateInvoiceNumber(),
      timezone: data.timezone,
      createdAt: this.dateTransformService.nowUTC(),
      updatedAt: this.dateTransformService.nowUTC(),
    });

    await this.invoiceRepository.save(invoice);

    const invoiceId = invoice.id;

    return { invoiceId };
  }

  private generateInvoiceNumber() {
    return `INV-${Date.now()}`;
  }
}
