import { HttpStatus } from '@nestjs/common';
import { Exception } from 'src/shared/exception';

export class DomainException extends Exception {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    args?: { statusCode?: HttpStatus; options?: { cause?: unknown } },
  ) {
    super(
      internalMessage,
      externalMessage,
      context,
      args?.statusCode ?? HttpStatus.BAD_REQUEST,
      args?.options,
    );
  }
}
