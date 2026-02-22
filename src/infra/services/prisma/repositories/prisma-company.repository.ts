import { PrismaService } from '../../prisma/prisma.service';
import { Company } from 'src/domain/entities/company';
import { CompanyRepository } from 'src/domain/repositories/company.repository';
import { Injectable } from '@nestjs/common';
import { Address } from 'src/domain/entities/address';
import { Subscription } from 'src/domain/entities/subscription';
import { PrismaCompanyMapper } from '../mappers/prisma-company.mapper';
import { PrismaWrapper } from '../wrapper/prisma.wrapper';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private prisma: PrismaService) {}

  async save(company: Company): Promise<void> {
    return await PrismaWrapper.handle(async () => {
      const row = PrismaCompanyMapper.toPrismaCreate(company);

      await this.prisma.company.create({
        data: { ...row },
        include: {
          address: true,
          subscriptions: true,
        },
      });
    });
  }

  async findByEmail(email: string): Promise<Company | null> {
    return await PrismaWrapper.handle(async () => {
      const company = await this.prisma.company.findUnique({
        where: { email },
        include: { address: true, subscriptions: true },
      });

      if (!company) return null;

      const companyFound = new Company({
        ...company,
        address: company.address
          ? new Address({ ...company.address, company_id: company.id })
          : undefined,
        phoneNumber: company.phone_number ?? undefined,
        subscriptions: company.subscriptions
          ? company.subscriptions.map(
              (s) =>
                new Subscription({
                  ...s,
                  companyId: company.id,
                  planId: s.plan_id,
                  planName: s.plan_name,
                  planType: s.plan_type,
                  servicesLimit: s.services_limit,
                  serviceExecutionsLimit: s.service_executions_limit,
                  clientCompanysLimit: s.client_companys_limit,
                  invoicesLimit: s.invoices_limit,
                  startDate: s.start_date,
                  endDate: s.end_date,
                  renewalDate: s.renewal_date,
                  createdAt: s.created_at,
                  updatedAt: s.updated_at,
                }),
            )
          : [],
        createdAt: company.created_at,
        updatedAt: company.updated_at,
      });

      return companyFound;
    });
  }

  async findById(id: string): Promise<Company | null> {
    return await PrismaWrapper.handle(async () => {
      const company = await this.prisma.company.findUnique({
        where: { id },
        include: { address: true, subscriptions: true },
      });

      if (!company) return null;

      const companyFound = new Company({
        ...company,
        address: company.address
          ? new Address({ ...company.address, company_id: company.id })
          : undefined,
        phoneNumber: company.phone_number ?? undefined,
        subscriptions: company.subscriptions
          ? company.subscriptions.map(
              (s) =>
                new Subscription({
                  ...s,
                  companyId: company.id,
                  planId: s.plan_id,
                  planName: s.plan_name,
                  planType: s.plan_type,
                  servicesLimit: s.services_limit,
                  serviceExecutionsLimit: s.service_executions_limit,
                  clientCompanysLimit: s.client_companys_limit,
                  invoicesLimit: s.invoices_limit,
                  startDate: s.start_date,
                  endDate: s.end_date,
                  renewalDate: s.renewal_date,
                  createdAt: s.created_at,
                  updatedAt: s.updated_at,
                }),
            )
          : [],
        createdAt: company.created_at,
        updatedAt: company.updated_at,
      });

      return companyFound;
    });
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    return await PrismaWrapper.handle(async () => {
      const company = await this.prisma.company.findUnique({
        where: { cnpj },
        include: { address: true, subscriptions: true },
      });

      if (!company) return null;

      const companyFound = new Company({
        ...company,
        address: company.address
          ? new Address({ ...company.address, company_id: company.id })
          : undefined,
        phoneNumber: company.phone_number ?? undefined,
        subscriptions: company.subscriptions
          ? company.subscriptions.map(
              (s) =>
                new Subscription({
                  ...s,
                  companyId: company.id,
                  planId: s.plan_id,
                  planName: s.plan_name,
                  planType: s.plan_type,
                  servicesLimit: s.services_limit,
                  serviceExecutionsLimit: s.service_executions_limit,
                  clientCompanysLimit: s.client_companys_limit,
                  invoicesLimit: s.invoices_limit,
                  startDate: s.start_date,
                  endDate: s.end_date,
                  renewalDate: s.renewal_date,
                  createdAt: s.created_at,
                  updatedAt: s.updated_at,
                }),
            )
          : [],
        createdAt: company.created_at,
        updatedAt: company.updated_at,
      });

      return companyFound;
    });
  }

  async update(company: Company): Promise<void> {
    return await PrismaWrapper.handle(async () => {
      const row = PrismaCompanyMapper.toPrismaUpdate(company);

      await this.prisma.company.update({
        where: { id: company.id },
        data: { ...row },
        include: { address: true },
      });
    });
  }
}
