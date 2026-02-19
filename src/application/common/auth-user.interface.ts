import { UserRole } from 'src/domain/common/user-role';

export abstract class AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
