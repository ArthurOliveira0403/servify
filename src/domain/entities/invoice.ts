import { randomUUID } from 'node:crypto';

export type InvoiceStatus = 'VALID' | 'INVALID';

interface InvoiceProps {
  id?: string;

  companyId: string;
  companyName: string;
  companyCnpj: string;
  companyPhone?: string;

  clientName: string;
  clientInternationalId: string;
  clientPhone?: string;

  serviceExecutionId: string;
  serviceName: string;
  serviceDescription: string;

  executedAt: Date;
  price: number; // cents

  issuedAt: Date;

  status?: InvoiceStatus;
  invoiceNumber: string;

  pdfPath?: string;

  timezone: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export class Invoice {
  private readonly _id: string;
  private readonly _companyId: string;
  private readonly _companyName: string;
  private readonly _companyCnpj: string;
  private readonly _companyPhone: string | null;
  private readonly _clientName: string;
  private readonly _clientInternationalId: string;
  private readonly _clientPhone: string | null;
  private readonly _serviceExecutionId: string;
  private readonly _serviceName: string;
  private readonly _serviceDescription: string;
  private readonly _executedAt: Date;
  private readonly _price: number; // cents
  private readonly _issuedAt: Date;
  private _status: InvoiceStatus;
  private _invoiceNumber: string;
  private _pdfPath: string | null;
  private readonly _timezone: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: InvoiceProps) {
    this._id = props.id ?? randomUUID();
    this._companyId = props.companyId;
    this._companyName = props.companyName;
    this._companyCnpj = props.companyCnpj;
    this._companyPhone = props.companyPhone ?? null;
    this._clientName = props.clientName;
    this._clientInternationalId = props.clientInternationalId;
    this._clientPhone = props.clientPhone ?? null;
    this._serviceExecutionId = props.serviceExecutionId;
    this._serviceName = props.serviceName;
    this._serviceDescription = props.serviceDescription;
    this._executedAt = props.executedAt;
    this._price = props.price;
    this._issuedAt = props.issuedAt;
    this._status = props.status ?? 'VALID';
    this._invoiceNumber = props.invoiceNumber;
    this._pdfPath = props.pdfPath ?? null;
    this._timezone = props.timezone;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  cancel() {
    if (this.status === 'INVALID') throw new Error('Invoice already canceled');

    this._status = 'INVALID';
    this._updatedAt = new Date();
  }

  update(pdfPath: string) {
    this._pdfPath = pdfPath;
  }

  get id() {
    return this._id;
  }
  get companyId() {
    return this._companyId;
  }
  get companyName() {
    return this._companyName;
  }
  get companyCnpj() {
    return this._companyCnpj;
  }
  get companyPhone() {
    return this._companyPhone;
  }
  get clientName() {
    return this._clientName;
  }
  get clientInternationalId() {
    return this._clientInternationalId;
  }
  get clientPhone() {
    return this._clientPhone;
  }
  get serviceExecutionId() {
    return this._serviceExecutionId;
  }
  get serviceName() {
    return this._serviceName;
  }
  get serviceDescription() {
    return this._serviceDescription;
  }
  get executedAt() {
    return this._executedAt;
  }
  get price() {
    return this._price;
  }
  get issuedAt() {
    return this._issuedAt;
  }
  get status() {
    return this._status;
  }
  get invoiceNumber() {
    return this._invoiceNumber;
  }
  get pdfPath() {
    return this._pdfPath;
  }
  get timezone() {
    return this._timezone;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
