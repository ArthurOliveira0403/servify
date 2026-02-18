import { randomUUID } from 'node:crypto';
import { SubscriptionException } from './exceptions/subscription-exception';
import { PlanType } from './plan';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED';
export enum Feature {
  SERVICE = 'SERVICE',
  SERVICE_EXECUTION = 'SERVICE_EXECUTION',
  CLIENT_COMPANY = 'CLIENT_COMPANY',
  INVOICE = 'INVOICE',
}

abstract class SubscriptionProps {
  id?: string;
  companyId: string;
  planId: string;
  planName: string;
  planType: PlanType;
  price: number;
  servicesLimit: number;
  serviceExecutionsLimit: number;
  clientCompanysLimit: number;
  invoicesLimit: number;
  status?: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  autoRenew?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Subscription {
  private _id: string;
  private _companyId: string;
  private _planId: string;
  private _planName: string;
  private _planType: PlanType;
  private _price: number;
  private _servicesLimit: number;
  private _serviceExecutionsLimit: number;
  private _clientCompanysLimit: number;
  private _invoicesLimit: number;
  private _status: SubscriptionStatus;
  private _startDate: Date;
  private _endDate: Date;
  private _renewalDate: Date;
  private _autoRenew: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: SubscriptionProps) {
    if (props.endDate <= props.startDate)
      throw new SubscriptionException(
        'The endDate is smaller than the startDate',
        'Invalid subscription period',
        Subscription.name,
      );

    this._id = props.id ?? randomUUID();
    this._companyId = props.companyId;
    this._planId = props.planId;
    this._planName = props.planName;
    this._planType = props.planType;
    this._price = props.price;
    this._servicesLimit = props.servicesLimit;
    this._serviceExecutionsLimit = props.serviceExecutionsLimit;
    this._clientCompanysLimit = props.clientCompanysLimit;
    this._invoicesLimit = props.invoicesLimit;
    this._status = props.status ?? 'ACTIVE';
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._renewalDate = props.renewalDate ?? props.endDate;
    this._autoRenew = props.autoRenew ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  assertCanUseFeature(feature: Feature, currentCount: number, now: Date) {
    const active = this.isActive(now);
    if (!active)
      throw new SubscriptionException(
        'Can not use anything feature because this subscription is expired',
        'Expired Subscription',
        Subscription.name,
      );

    const limit = this.limit(feature);

    if (limit <= currentCount)
      throw new SubscriptionException(
        `The ${feature} limit of ${this.id} subcription reached`,
        `${feature} limit reached`,
        Subscription.name,
      );
  }

  private limit(feature: Feature) {
    switch (feature) {
      case Feature.SERVICE:
        return this.servicesLimit;
      case Feature.SERVICE_EXECUTION:
        return this.serviceExecutionsLimit;
      case Feature.CLIENT_COMPANY:
        return this.clientCompanysLimit;
      case Feature.INVOICE:
        return this.invoicesLimit;
    }
  }

  isActive(now: Date): boolean {
    return this.status === 'ACTIVE' && now < this.endDate;
  }

  expire(now: Date) {
    if (now > this.endDate) {
      this._status = 'EXPIRED';
      this._updatedAt = now;
    }
  }

  renew(newEndDate: Date, now: Date) {
    if (!this.autoRenew)
      throw new SubscriptionException(
        'Subscription is not set to auto renew',
        'Auto renew subscription disable',
        Subscription.name,
      );

    if (newEndDate <= this.endDate)
      throw new SubscriptionException(
        'The new endDate is smaller than the old endDate',
        'Invalid subscription endDate',
        Subscription.name,
      );

    if (newEndDate <= now)
      throw new SubscriptionException(
        'The newEndDate is smaller than the nowDate',
        'Invalid new subscription period',
        Subscription.name,
      );

    this._status = 'ACTIVE';
    this._startDate = now;
    this._endDate = newEndDate;
    this._renewalDate = newEndDate;
    this._updatedAt = now;
  }

  cancelAtPeriodEnd(now: Date) {
    if (this.status !== 'ACTIVE')
      throw new SubscriptionException(
        'Only active subscriptions can be canceled',
        'Only active subscriptions can be canceled',
        Subscription.name,
      );

    if (!this.autoRenew)
      throw new SubscriptionException(
        'Already subscription canceled',
        'Already subscription canceled',
        Subscription.name,
      );

    this._autoRenew = false;
    this._updatedAt = now;
  }

  get id() {
    return this._id;
  }
  get companyId() {
    return this._companyId;
  }
  get planId() {
    return this._planId;
  }
  get planName() {
    return this._planName;
  }
  get planType() {
    return this._planType;
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
  get status() {
    return this._status;
  }
  get startDate() {
    return this._startDate;
  }
  get endDate() {
    return this._endDate;
  }
  get renewalDate() {
    return this._renewalDate;
  }
  get autoRenew() {
    return this._autoRenew;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }
}
