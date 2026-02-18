/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthUser } from 'src/domain/common/auth-user.interface';
import { CheckActiveSubscriptionUseCase } from 'src/application/use-cases/check-active-subscription.use-case';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private checkActiveSubcription: CheckActiveSubscriptionUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    return await this.checkActiveSubcription.handle({ companyId: user.id });
  }
}
