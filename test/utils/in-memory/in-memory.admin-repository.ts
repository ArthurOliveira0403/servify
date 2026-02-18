/* eslint-disable @typescript-eslint/await-thenable */
import { Admin } from 'src/domain/entities/admin';
import { AdminRepository } from 'src/domain/repositories/admin.repository';

export class InMemoryAdminRepository implements AdminRepository {
  admins: Admin[] = [];

  async findByEmail(email: string): Promise<Admin | null> {
    await this.seed();

    const admin = await this.admins.find((a) => a.email === email);

    return admin ?? null;
  }

  async findById(id: string): Promise<Admin | null> {
    const admin = await this.admins.find((a) => a.id === id);

    return admin ?? null;
  }

  private async seed(): Promise<void> {
    const admin = new Admin({
      id: '1',
      email: 'admin@email.com',
      // "_hash" simula uma senha hasheada. Ver hasherServiceMock!
      password: '123456_hash',
    });

    await this.admins.push(admin);
  }
}
