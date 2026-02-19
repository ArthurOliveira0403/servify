import { DomainException } from './domain-exception';

export class ClientCompanyException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
