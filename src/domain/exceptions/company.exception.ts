import { DomainException } from './domain-exception';

export class CompanyException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
