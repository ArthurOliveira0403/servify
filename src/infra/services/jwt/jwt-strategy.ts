import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import { TokenPayload } from 'src/application/services/ijwt.service';
import { AuthUser } from 'src/application/common/auth-user.interface';
import {
  type IValidateUserService,
  VALIDATE_USER_SERVICE,
} from 'src/application/services/ivalidate-user.service';
import { JwtSecretNotFoundException } from 'src/infra/exceptions/jwt-secret-not-found.exception';
import { UserNotFoundException } from 'src/infra/exceptions/user-not-found.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(VALIDATE_USER_SERVICE)
    private validateUserService: IValidateUserService,
  ) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET)
      throw new JwtSecretNotFoundException(
        'JWT_SECRET not found in JwtStrategy',
        JwtStrategy.name,
      );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenPayload): Promise<AuthUser> {
    const user = await this.validateUserService.handle({
      userId: payload.sub,
      userRole: payload.role,
    });

    if (!user)
      throw new UserNotFoundException('User not found', JwtStrategy.name);

    return user;
  }
}
