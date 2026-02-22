import { HttpStatus } from '@nestjs/common';
import { InfraException } from './infra.exception';

export class ZodValidatorPipeException extends InfraException {
  private readonly _zodError: unknown;

  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    zodError: unknown,
    options?: { cause?: unknown },
  ) {
    super(
      internalMessage,
      externalMessage,
      context,
      HttpStatus.BAD_REQUEST,
      options,
    );
    this._zodError = zodError;
  }

  get zodError() {
    return this._zodError;
  }
}
