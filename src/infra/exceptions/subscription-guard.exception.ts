import { Exception } from 'src/shared/exception';

export class SubscriptionGuardException extends Exception {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = SubscriptionGuardException.name;
  }
}
