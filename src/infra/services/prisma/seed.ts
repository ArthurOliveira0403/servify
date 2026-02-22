import { SeedException } from '../../exceptions/seed-database.exception';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const logger = new Logger();

class SeedPrisma {
  static async main() {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (!ADMIN_EMAIL)
      throw new SeedException(
        'ADMIN_EMAIL not exist',
        `Run seed in: ${SeedPrisma.name}`,
      );
    if (!ADMIN_EMAIL.includes('@'))
      throw new SeedException(
        'ADMIN_EMAIL is invalid',
        `Run seed in: ${SeedPrisma.name}`,
      );

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD)
      throw new SeedException(
        'ADMIN_PASSWORD not exist',
        `Run seed in: ${SeedPrisma.name}`,
      );
    if (ADMIN_PASSWORD.length < 4 || ADMIN_PASSWORD.length > 20)
      throw new SeedException(
        'ADMIN_EMAIL is very small or very large',
        `Run seed in: ${SeedPrisma.name}`,
      );

    const adminExist = await prisma.admin.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!adminExist) {
      const hashPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await prisma.admin.create({
        data: {
          id: randomUUID(),
          email: ADMIN_EMAIL,
          password: hashPassword,
          role: 'ADMIN',
        },
      });
      logger.log('Admin succesfully created');
    } else {
      logger.warn('Admin already exist. Ignored seed');
    }
  }
}

SeedPrisma.main()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
