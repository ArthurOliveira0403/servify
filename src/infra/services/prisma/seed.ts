import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { SeedException } from 'src/infra/exceptions/seed.exception';

const prisma = new PrismaClient();
const logger = new Logger();

async function main() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  if (!ADMIN_EMAIL)
    throw new SeedException(
      'ADMIN_EMAIL not exist',
      'ADMIN_EMAIL not exist',
      `Run seed in: ${main.name}`,
    );

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD)
    throw new SeedException(
      'ADMIN_PASSWORD not exist',
      'ADMIN_PASSWORD not exist',
      `Run seed in: ${main.name}`,
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

main()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
