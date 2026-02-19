import { DomainException } from './domain-exception';

export class AdminException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
