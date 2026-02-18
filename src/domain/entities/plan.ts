import { randomUUID } from 'node:crypto';

export type PlanType = 'MONTHLY' | 'YEARLY';

abstract class PlanProps {
  id?: string;
  name: string;
  type: PlanType;
  price: number;
  servicesLimit: number;
  serviceExecutionsLimit: number;
  clientCompanysLimit: number;
  invoicesLimit: number;
  createdAt?: Date;
  updatedAt?: Date;
}

abstract class UpdateProps {
  name?: string;
  type?: PlanType;
  price?: number;
  servicesLimit?: number;
  serviceExecutionsLimit?: number;
  clientCompanysLimit?: number;
  invoiceLimit?: number;
  updatedAt: Date;
}

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
    this._id = props.id ?? randomUUID();
    this._name = props.name;
    this._type = props.type;
    this._price = props.price;
    this._servicesLimit = props.servicesLimit;
    this._serviceExecutionsLimit = props.serviceExecutionsLimit;
    this._clientCompanysLimit = props.clientCompanysLimit;
    this._invoicesLimit = props.invoicesLimit;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public update(props: UpdateProps) {
    this._name = props.name ?? this.name;
    this._type = props.type ?? this.type;
    this._price = props.price ?? this.price;
    this._servicesLimit = props.servicesLimit ?? this.servicesLimit;
    this._serviceExecutionsLimit =
      props.serviceExecutionsLimit ?? this.serviceExecutionsLimit;
    this._clientCompanysLimit =
      props.clientCompanysLimit ?? this.clientCompanysLimit;
    this._invoicesLimit = props.invoiceLimit ?? this.invoicesLimit;
    this._updatedAt = props.updatedAt;
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
