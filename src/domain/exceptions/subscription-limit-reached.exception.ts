import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain-exception';

export class SubscriptonLimitReachedException extends DomainException {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(internalMessage, externalMessage, context, {
      statusCode: HttpStatus.FORBIDDEN,
      options,
    });
  }
}
