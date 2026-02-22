import { InfraException } from './infra.exception';
import { HttpStatus } from '@nestjs/common';

export class NotFoundException extends InfraException {
  constructor(
    internalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      'Intern resources was not found, try again later',
      context,
      HttpStatus.NOT_FOUND,
      options,
    );
  }
}
