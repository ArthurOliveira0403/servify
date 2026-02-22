import { HttpStatus } from '@nestjs/common';
import { Exception } from '../../shared/exception';

export class InfraException extends Exception {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    statusCode: HttpStatus,
    options?: { cause?: unknown },
  ) {
    super(internalMessage, externalMessage, context, statusCode, options);
  }
}
