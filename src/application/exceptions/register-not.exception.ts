import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from './application.exception';

export class RegisterNotException extends ApplicationException {
  constructor(
    internalMessage: string,
    context: string,
    options?: { cause: unknown },
  ) {
    super(
      internalMessage,
      'Something was no registed in server. Try again later',
      context,
      HttpStatus.NOT_IMPLEMENTED,
      options,
    );
  }
}
