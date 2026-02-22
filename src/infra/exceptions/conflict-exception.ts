import { InfraException } from './infra.exception';
import { HttpStatus } from '@nestjs/common';

export class ConflictException extends InfraException {
  constructor(
    internalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      'Intern resources was conflict, try again later',
      context,
      HttpStatus.CONFLICT,
      { cause: options?.cause },
    );
  }
}
