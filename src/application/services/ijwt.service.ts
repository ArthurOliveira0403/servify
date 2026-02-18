import { UserRole } from 'src/domain/common/user-role';

export const JWT_SERVICE = 'JWT_SERVICE';

export abstract class TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface IJwtService {
  sign(payload: TokenPayload): string;
}
