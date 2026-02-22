import { Prisma } from '@prisma/client';
import { ConflictException } from 'src/infra/exceptions/conflict-exception';
import { DatabaseException } from 'src/infra/exceptions/database.exception';
import { NotFoundException } from 'src/infra/exceptions/not-found.exception';

export class PrismaExceptionsMapper {
  static map(error: unknown): DatabaseException {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return new ConflictException(
            'Unique constraint violed',
            error.stack!,
            { cause: error },
          );
        case 'P2025':
          return new NotFoundException('Record not found', error.stack!, {
            cause: error,
          });
      }
    }

    return new DatabaseException(error);
  }
}
