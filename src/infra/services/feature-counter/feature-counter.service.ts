import { Injectable } from '@nestjs/common';
import { IFeatureCounterService } from 'src/application/services/ifeature-counter.service';
import { PrismaService } from '../prisma/prisma.service';
import { Feature } from 'src/domain/entities/subscription';
import { FeatureCounterException } from '../../exceptions/feature-counter.exception';

@Injectable()
export class FeatureCounterService implements IFeatureCounterService {
  constructor(private prisma: PrismaService) {}

  async handle(feature: Feature, companyId: string): Promise<number> {
    switch (feature) {
      case Feature.SERVICE:
        return await this.prisma.service.count({
          where: { company_id: companyId },
        });
      case Feature.SERVICE_EXECUTION:
        return await this.prisma.serviceExecution.count({
          where: { company_id: companyId },
        });
      case Feature.CLIENT_COMPANY:
        return await this.prisma.clientCompany.count({
          where: { company_id: companyId },
        });
      case Feature.INVOICE:
        return await this.prisma.invoice.count({
          where: { company_id: companyId },
        });
      default:
        throw new FeatureCounterException(
          'Feature type not register',
          'Invalid feature type',
          FeatureCounterService.name,
        );
    }
  }
}
