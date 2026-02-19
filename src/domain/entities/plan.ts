import { randomUUID } from 'node:crypto';
import { PlanException } from '../exceptions/plan.exception';

export type PlanType = 'MONTHLY' | 'YEARLY';

type PlanProps = {
  id?: string;
  name: string;
  type: PlanType;
  price: number;
  servicesLimit: number;
  serviceExecutionsLimit: number;
  clientCompanysLimit: number;
  invoicesLimit: number;
  createdAt: Date;
  updatedAt: Date;
};

type UpdateProps = {
  name?: string;
  type?: PlanType;
  price?: number;
  servicesLimit?: number;
  serviceExecutionsLimit?: number;
  clientCompanysLimit?: number;
  invoicesLimit?: number;
  now: Date;
};

export class Plan {
  private readonly _id: string;
  private _name: string;
  private _type: PlanType;
  private _price: number;
  private _servicesLimit: number;
  private _serviceExecutionsLimit: number;
  private _clientCompanysLimit: number;
  private _invoicesLimit: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PlanProps) {
    this.validateCreate(props);

    this._id = props.id ?? randomUUID();
    this._name = props.name;
    this._type = props.type;
    this._price = props.price;
    this._servicesLimit = props.servicesLimit;
    this._serviceExecutionsLimit = props.serviceExecutionsLimit;
    this._clientCompanysLimit = props.clientCompanysLimit;
    this._invoicesLimit = props.invoicesLimit;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public update(props: UpdateProps) {
    this.validateUpdate(props);

    this._name = props.name ?? this.name;
    this._type = props.type ?? this.type;
    this._price = props.price ?? this.price;
    this._servicesLimit = props.servicesLimit ?? this.servicesLimit;
    this._serviceExecutionsLimit =
      props.serviceExecutionsLimit ?? this.serviceExecutionsLimit;
    this._clientCompanysLimit =
      props.clientCompanysLimit ?? this.clientCompanysLimit;
    this._invoicesLimit = props.invoicesLimit ?? this.invoicesLimit;
    this._updatedAt = props.now;
  }

  private validateCreate(props: PlanProps) {
    if (props.name.length < 2 || props.name.length > 30)
      throw new PlanException('Name very small or very large');

    if (props.price < 0) throw new PlanException('Price cannot be negative');

    if (props.servicesLimit < 0)
      throw new PlanException('Services limit cannot be negative');

    if (props.serviceExecutionsLimit < 0)
      throw new PlanException('Service execution limit cannot be negative');

    if (props.clientCompanysLimit < 0)
      throw new PlanException('Clients company cannot be negative');

    if (props.invoicesLimit < 0)
      throw new PlanException('Invoices limit cannot be negative');
  }

  private validateUpdate(props: UpdateProps) {
    if (props.name)
      if (props.name.length < 2 || props.name.length > 30)
        throw new PlanException('Name very small or very large');

    if (props.price !== undefined)
      if (props.price < 0) throw new PlanException('Price cannot be negative');

    if (props.servicesLimit !== undefined)
      if (props.servicesLimit < 0)
        throw new PlanException('Services limit cannot be negative');
    if (props.serviceExecutionsLimit !== undefined)
      if (props.serviceExecutionsLimit < 0)
        throw new PlanException('Service execution limit cannot be negative');
    if (props.clientCompanysLimit !== undefined)
      if (props.clientCompanysLimit < 0)
        throw new PlanException('Clients company cannot be negative');
    if (props.invoicesLimit !== undefined)
      if (props.invoicesLimit < 0)
        throw new PlanException('Invoices limit cannot be negative');
  }

  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get type() {
    return this._type;
  }
  get price() {
    return this._price;
  }
  get servicesLimit() {
    return this._servicesLimit;
  }
  get serviceExecutionsLimit() {
    return this._serviceExecutionsLimit;
  }
  get clientCompanysLimit() {
    return this._clientCompanysLimit;
  }
  get invoicesLimit() {
    return this._invoicesLimit;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
