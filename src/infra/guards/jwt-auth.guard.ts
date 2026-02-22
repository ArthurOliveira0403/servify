import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC } from '../decorators/public.decorator';
import { UnauthorizedException } from '../exceptions/unauthorized.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<AuthUser>(err: any, user: AuthUser): AuthUser {
    if (err) throw err;

    if (!user)
      throw new UnauthorizedException(
        'Error in validate token',
        'Invalid or exist not token',
        JwtAuthGuard.name,
      );

    return user;
  }
}
