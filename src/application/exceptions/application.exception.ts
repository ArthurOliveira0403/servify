import { HttpStatus } from '@nestjs/common';
import { Exception } from 'src/shared/exception';

export class ApplicationException extends Exception {
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
