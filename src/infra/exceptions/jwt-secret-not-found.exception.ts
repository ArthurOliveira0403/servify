import { InfraException } from './infra.exception';
import { HttpStatus } from '@nestjs/common';

export class JwtSecretNotFoundException extends InfraException {
  constructor(
    internalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      'Authenticate service unavailable, try again later',
      context,
      HttpStatus.SERVICE_UNAVAILABLE,
      options,
    );
  }
}
