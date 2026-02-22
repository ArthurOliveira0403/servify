import { InfraException } from './infra.exception';
import { HttpStatus } from '@nestjs/common';

export class FeatureNotFoundException extends InfraException {
  constructor(
    internalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      'Feature unavalible, try again later',
      context,
      HttpStatus.NOT_FOUND,
      options,
    );
  }
}
