import { DomainException } from './domain-exception';

export class ClientException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
