import { randomUUID } from 'node:crypto';
import { UserRole } from '../common/user-role';
import { AdminException } from '../exceptions/admin.exception';

type AdminProps = {
  id?: string;
  email: string;
  password: string;
};

export class Admin {
  private readonly _id: string;
  private _email: string;
  private _password: string;
  private readonly _role: UserRole;

  constructor(props: AdminProps) {
    this.validateProps(props);

    this._id = props.id ?? randomUUID();
    this._email = props.email;
    this._password = props.password;
    this._role = 'ADMIN';
  }

  private validateProps(props: AdminProps) {
    if (!props.email.includes('@'))
      throw new AdminException(
        'Invalid Email on processing admin entity',
        'Invalid email',
        Admin.name,
      );
    if (props.password.length < 4 || props.password.length > 100)
      throw new AdminException(
        'Invalid password on processing admin entity',
        'Password very small or very large',
        Admin.name,
      );
  }

  get id() {
    return this._id;
  }
  get email() {
    return this._email;
  }
  get password() {
    return this._password;
  }

  get role() {
    return this._role;
  }
}
