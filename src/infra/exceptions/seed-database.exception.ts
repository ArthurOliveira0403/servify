import { HttpStatus } from '@nestjs/common';
import { InfraException } from './infra.exception';

export class SeedException extends InfraException {
  constructor(
    internalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      'Internal Server Error',
      context,
      HttpStatus.INTERNAL_SERVER_ERROR,
      options,
    );
  }
}
