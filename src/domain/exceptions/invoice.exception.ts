import { DomainException } from './domain-exception';

export class InvoiceException extends DomainException {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    options?: { cause?: unknown },
  ) {
    super(internalMessage, externalMessage, context, options);
  }
}
