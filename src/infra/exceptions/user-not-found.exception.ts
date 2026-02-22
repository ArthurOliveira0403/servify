import { HttpStatus } from '@nestjs/common';
import { InfraException } from './infra.exception';

export class UserNotFoundException extends InfraException {
  constructor(
    internalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      'User not found',
      context,
      HttpStatus.FORBIDDEN,
      options,
    );
  }
}
