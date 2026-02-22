/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthUser } from 'src/application/common/auth-user.interface';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ForbiddenException } from '../exceptions/forbidden.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflactor: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    const requiredRoles = this.reflactor.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const canAccess = requiredRoles.includes(user.role);

    if (!canAccess)
      throw new ForbiddenException(
        `The user ${user.id} has not the required roles for access`,
        'Cannot be access this method',
        RolesGuard.name,
      );

    return true;
  }
}
