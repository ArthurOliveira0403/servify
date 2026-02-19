import { DomainException } from './domain-exception';

export class ServiceException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
