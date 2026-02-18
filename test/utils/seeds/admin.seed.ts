import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/infra/services/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export async function adminSeed(
  prisma: PrismaService,
  data: { email: string; password: string },
) {
  try {
    const hashPassword = await bcrypt.hash(data.password, 10);

    await prisma.admin.create({
      data: {
        id: randomUUID(),
        email: data.email,
        password: hashPassword,
        role: 'ADMIN',
      },
    });
    return;
  } catch (error) {
    throw new Error(`Error in adminSeed ${error}`);
  }
}
