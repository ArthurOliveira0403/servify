import { DomainException } from './domain-exception';

export class serviceExecutionException extends DomainException {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(internalMessage, externalMessage, context, options);
  }
}
