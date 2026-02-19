import { DomainException } from './domain-exception';

export class InvoiceException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
