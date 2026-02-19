import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import { TokenPayload } from 'src/application/services/ijwt.service';
import { AuthUser } from 'src/application/common/auth-user.interface';
import {
  type IValidateUserService,
  VALIDATE_USER_SERVICE,
} from 'src/application/services/ivalidate-user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(VALIDATE_USER_SERVICE)
    private validateUserService: IValidateUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'defaultSecret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenPayload): Promise<AuthUser> {
    return await this.validateUserService.handle({
      userId: payload.sub,
      userRole: payload.role,
    });
  }
}
