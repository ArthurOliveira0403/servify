/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthUser } from 'src/application/common/auth-user.interface';
import { CheckActiveSubscriptionUseCase } from 'src/application/use-cases/check-active-subscription.use-case';
import { ForbiddenException } from '../exceptions/forbidden.exception';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private checkActiveSubcription: CheckActiveSubscriptionUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    const isActive = await this.checkActiveSubcription.handle({
      companyId: user.id,
    });

    if (!isActive)
      throw new ForbiddenException(
        `The user of id:${user.id} has not an active subscription`,
        'Non active subscripiton',
        SubscriptionGuard.name,
      );

    return true;
  }
}
