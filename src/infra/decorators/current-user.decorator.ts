import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from 'src/application/common/auth-user.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
