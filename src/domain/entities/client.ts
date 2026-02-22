import { randomUUID } from 'node:crypto';
import { ClientException } from '../exceptions/client.exception';

type ClientProps = {
  id?: string;
  fullName: string;
  internationalId: string;
  createdAt: Date;
};

export class Client {
  private readonly _id: string;
  private _fullName: string;
  private _internationalId: string;
  private _createdAt: Date;

  constructor(props: ClientProps) {
    this.validateProps(props);

    this._id = props.id ?? randomUUID();
    this._fullName = props.fullName;
    this._internationalId = props.internationalId;
    this._createdAt = props.createdAt;
  }

  private validateProps(props: ClientProps) {
    if (props.fullName.length < 2 || props.fullName.length > 100)
      throw new ClientException(
        'Invalid Email on processing Client entity',
        'Name vary small or very large',
        Client.name,
      );
  }

  get id() {
    return this._id;
  }
  get fullName() {
    return this._fullName;
  }
  get internationalId() {
    return this._internationalId;
  }
  get createdAt() {
    return this._createdAt;
  }
}
