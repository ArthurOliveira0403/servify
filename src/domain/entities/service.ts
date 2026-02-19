import { randomUUID } from 'node:crypto';
import { ServiceException } from '../exceptions/service.exception';

type ServiceProps = {
  id?: string;
  companyId: string;
  name: string;
  description: string;
  basePrice: number; // cents
  createdAt: Date;
  updatedAt: Date;
};

type UpdateServiceProps = {
  name?: string;
  description?: string;
  basePrice?: number; // cents
  now: Date;
};

export class Service {
  private readonly _id: string;
  private readonly _companyId: string;
  private _name: string;
  private _description: string;
  private _basePrice: number; // cents
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ServiceProps) {
    this.validateCreate(props);

    this._id = props.id ?? randomUUID();
    this._companyId = props.companyId;
    this._name = props.name;
    this._description = props.description;
    this._basePrice = props.basePrice;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public update(props: UpdateServiceProps) {
    this.validateUpdate(props);

    this._description = props.description ?? this.description;
    this._basePrice = props.basePrice ?? this.basePrice;
    this._updatedAt = props.now;
  }

  private validateCreate(props: ServiceProps) {
    if (props.name.length < 2 || props.name.length > 50)
      throw new ServiceException('Name very small or very large');

    if (props.description.length < 2)
      throw new ServiceException('Description very small');

    if (props.basePrice < 0)
      throw new ServiceException('Base price cannot be negative');
  }

  private validateUpdate(props: UpdateServiceProps) {
    if (props.name)
      if (props.name.length < 2 || props.name.length > 50)
        throw new ServiceException('Name very small or very large');

    if (props.description)
      if (props.description.length < 2)
        throw new ServiceException('Description very small');

    if (props.basePrice !== undefined)
      if (props.basePrice < 0)
        throw new ServiceException('Base price cannot be negative');
  }

  get id() {
    return this._id;
  }
  get companyId() {
    return this._companyId;
  }
  get name() {
    return this._name;
  }
  get description() {
    return this._description;
  }
  get basePrice() {
    return this._basePrice;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
