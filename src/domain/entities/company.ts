import { randomUUID } from 'node:crypto';
import { Address } from './address';
import { Subscription } from 'src/domain/entities/subscription';
import { UserRole } from '../common/user-role';
import { CompanyException } from '../exceptions/company.exception';

type CompanyProps = {
  id?: string;
  name: string;
  email: string;
  password: string;
  cnpj: string;
  address?: Address;
  phoneNumber?: string;
  subscriptions?: Subscription[];
  createdAt: Date;
  updatedAt: Date;
};

type CompanyDetailsProps = {
  name?: string;
  address?: Partial<Address>;
  phoneNumber?: string;
  now: Date;
};

export class Company {
  private readonly _role: UserRole;
  private readonly _id: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _cnpj: string;
  private _address: Address | null;
  private _phoneNumber: string | null;
  private _subscriptions: Subscription[] | [];
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: CompanyProps) {
    this.validateCreate(props);

    this._role = 'COMPANY';
    this._id = props.id ?? randomUUID();
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this._cnpj = props.cnpj;
    this._address = props.address ?? null;
    this._phoneNumber = props.phoneNumber ?? null;
    this._subscriptions = props.subscriptions ?? [];
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public update(props: CompanyDetailsProps) {
    this.validateUpdate(props);

    if (props.name !== undefined) this._name = props.name;
    if (props.phoneNumber !== undefined) this._phoneNumber = props.phoneNumber;
    if (props.address) {
      if (this._address) {
        this._address.update(props.address);
      } else {
        this._address = new Address({ company_id: this._id, ...props.address });
      }
    }
    this._updatedAt = props.now;
  }

  private validateCreate(props: CompanyProps) {
    if (props.name.length < 2 || props.name.length > 100)
      throw new CompanyException(
        'Invalid name on processing Company entity',
        'Name very smal or very large',
        Company.name,
      );
    if (props.password.length < 4 || props.password.length > 100)
      throw new CompanyException(
        'Invalid Password on processing Company entity',
        'Password very small or very lage',
        Company.name,
      );
    if (!props.email.includes('@'))
      throw new CompanyException(
        'Invalid Email on processing Company entity',
        'Invalid email',
        Company.name,
      );
  }

  private validateUpdate(props: CompanyDetailsProps) {
    if (props.name !== undefined)
      if (props.name.length < 2 || props.name.length > 100)
        throw new CompanyException(
          'Invalid name on processing Company entity',
          'Name very smal or very large',
          Company.name,
        );
  }

  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get email() {
    return this._email;
  }
  get password() {
    return this._password;
  }
  get cnpj() {
    return this._cnpj;
  }
  get address() {
    return this._address;
  }
  get phoneNumber() {
    return this._phoneNumber;
  }
  get subscriptions() {
    return this._subscriptions;
  }
  get role() {
    return this._role;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
