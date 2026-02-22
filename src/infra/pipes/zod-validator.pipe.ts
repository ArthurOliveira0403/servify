import { PipeTransform } from '@nestjs/common';
import { ZodValidatorPipeException } from '../exceptions/zod-validator-pipe.exception';
import z, { ZodType } from 'zod';

export class ZodValidatorPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);

      return parsedValue;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodError = z.flattenError(error);

        throw new ZodValidatorPipeException(
          `Error while validating request`,
          `The request data is invalid`,
          ZodValidatorPipe.name,
          zodError,
        );
      }
    }
  }
}
