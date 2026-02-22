import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from './application.exception';

export class EntityNotFoundException extends ApplicationException {
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
      HttpStatus.NOT_FOUND,
      options,
    );
  }
}
