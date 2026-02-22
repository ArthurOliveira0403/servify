import { HttpStatus } from '@nestjs/common';
import { InfraException } from './infra.exception';

export class NonActiveSubscriptionException extends InfraException {
  constructor(
    internalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      'The User have not an active subscription',
      context,
      HttpStatus.FORBIDDEN,
      options,
    );
  }
}
