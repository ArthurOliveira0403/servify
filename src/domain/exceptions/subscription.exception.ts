import { DomainException } from './domain-exception';

export class SubscriptionException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
