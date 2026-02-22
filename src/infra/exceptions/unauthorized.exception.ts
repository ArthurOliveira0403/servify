import { InfraException } from './infra.exception';
import { HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends InfraException {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      externalMessage,
      context,
      HttpStatus.UNAUTHORIZED,
      options,
    );
  }
}
