import { HttpStatus } from '@nestjs/common';
import { InfraException } from './infra.exception';

export class InvoicePdfStorageException extends InfraException {
  constructor(
    internalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      'Error in archives storage',
      context,
      HttpStatus.SERVICE_UNAVAILABLE,
      options,
    );
  }
}
