import { DomainException } from './domain-exception';

export class PlanException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
