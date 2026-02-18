import { Exception } from 'src/shared/exception';

export class SeedException extends Exception {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context?: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = SeedException.name;
  }
}
