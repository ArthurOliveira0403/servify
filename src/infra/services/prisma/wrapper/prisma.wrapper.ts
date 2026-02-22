import { PrismaExceptionsMapper } from '../mappers/prisma-exceptions.mapper';

export class PrismaWrapper {
  static async handle<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw PrismaExceptionsMapper.map(error);
    }
  }
}
