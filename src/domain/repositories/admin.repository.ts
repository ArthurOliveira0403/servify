import { Admin } from '../entities/admin';

export const ADMIN_REPOSITORY = 'ADMIN_REPOSITORY';

export interface AdminRepository {
  findById(id: string): Promise<Admin | null>;
  findByEmail(email: string): Promise<Admin | null>;
}
