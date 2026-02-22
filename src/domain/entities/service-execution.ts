import { randomUUID } from 'crypto';
import { serviceExecutionException } from '../exceptions/service-execution.exception';

export type ServiceExecutionStatus = 'PENDING' | 'DONE' | 'CANCELED';

type ServiceExecutionProps = {
  id?: string;
  companyId: string;
  serviceId: string;
  clientCompanyId: string;
  executedAt: Date;
  price: number; // cents
  status?: ServiceExecutionStatus;
  createdAt: Date;
  updatedAt: Date;
};

type UpdateDetailsProps = {
  serviceId?: string;
  clientCompanyId?: string;
  executedAt?: Date;
  price?: number;
  status?: ServiceExecutionStatus;
  now: Date;
};

export class ServiceExecution {
  private readonly _id: string;
  private _companyId: string;
  private _serviceId: string;
  private _clientCompanyId: string;
  private _executedAt: Date;
  private _price: number; // cents
  private _status: ServiceExecutionStatus;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ServiceExecutionProps) {
    this.validateCreate(props);

    this._id = props.id ?? randomUUID();
    this._companyId = props.companyId;
    this._serviceId = props.serviceId;
    this._clientCompanyId = props.clientCompanyId;
    this._executedAt = props.executedAt;
    this._price = props.price;
    this._status = props.status ?? 'PENDING';
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  updateDetails(props: UpdateDetailsProps) {
    this.validateUpdate(props);

    this._executedAt = props.executedAt ?? this.executedAt;
    this._price = props.price ?? this.price;
    this._status = props.status ?? this.status;
    this._updatedAt = props.now;
  }

  private validateCreate(props: ServiceExecutionProps) {
    if (props.price < 0)
      throw new serviceExecutionException(
        'Invalid Price on processing Plan entity',
        'Price cannot be negative',
        ServiceExecution.name,
      );
  }

  private validateUpdate(props: UpdateDetailsProps) {
    if (props.price !== undefined)
      if (props.price < 0)
        throw new serviceExecutionException(
          'Invalid Price on processing Plan entity',
          'Price cannot be negative',
          ServiceExecution.name,
        );
  }

  get id() {
    return this._id;
  }
  get companyId() {
    return this._companyId;
  }
  get serviceId() {
    return this._serviceId;
  }
  get clientCompanyId() {
    return this._clientCompanyId;
  }
  get executedAt() {
    return this._executedAt;
  }
  get price() {
    return this._price;
  }
  get status() {
    return this._status;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
