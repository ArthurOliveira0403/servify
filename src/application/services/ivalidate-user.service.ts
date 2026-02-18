import { AuthUser } from 'src/domain/common/auth-user.interface';
import { UserRole } from 'src/domain/common/user-role';

export const VALIDATE_USER_SERVICE = 'VALIDATE_USER_SERVICE';

export type ValidaterUserServiceDTO = {
  userId: string;
  userRole: UserRole;
};

export interface IValidateUserService {
  handle(data: ValidaterUserServiceDTO): Promise<AuthUser>;
}
