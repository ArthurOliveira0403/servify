import { DomainException } from './domain-exception';

export class serviceExecutionException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
