import { HttpStatus } from '@nestjs/common';

export abstract class Exception extends Error {
  private readonly _externalMessage: string;
  private readonly _context: string;
  private readonly _timeStamp: string;
  private readonly _statusCode: HttpStatus;

  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    statusCode: HttpStatus,
    options?: { cause?: unknown },
  ) {
    super(internalMessage, options);
    this._externalMessage = externalMessage;
    this._context = context;
    this._statusCode = statusCode;
    this._timeStamp = new Date().toISOString();

    this.name = new.target.name;
  }

  get externalMessage() {
    return this._externalMessage;
  }
  get context() {
    return this._context;
  }
  get timeStamp() {
    return this._timeStamp;
  }
  get statusCode() {
    return this._statusCode;
  }
}
