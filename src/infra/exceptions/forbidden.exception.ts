import { InfraException } from './infra.exception';
import { HttpStatus } from '@nestjs/common';

export class ForbiddenException extends InfraException {
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
      HttpStatus.FORBIDDEN,
      options,
    );
  }
}
