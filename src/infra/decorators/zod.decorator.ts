import { ZodType } from 'zod';
import { ZodValidatorPipe } from '../pipes/zod-validator.pipe';

export const Zod = (schema: ZodType) => new ZodValidatorPipe(schema);
