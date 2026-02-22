import { InfraException } from './infra.exception';
import { HttpStatus } from '@nestjs/common';

export class DatabaseException extends InfraException {
  constructor(cause: unknown) {
    super(
      'Unexpected error in database service',
      'Error in database service, try again later',
      DatabaseException.name,
      HttpStatus.SERVICE_UNAVAILABLE,
      { cause },
    );
  }
}
