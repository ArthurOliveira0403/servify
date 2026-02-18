import { ApplicationException } from './application-exceptions';

export class ForbiddenException extends ApplicationException {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = ForbiddenException.name;
  }
}
