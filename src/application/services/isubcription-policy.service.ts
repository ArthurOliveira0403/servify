import { Feature } from 'src/domain/entities/subscription';

export const SUBSCRIPTION_POLICY_SERVICE = 'SUBSCRIPTION_POLICY_SERVICE';

export interface ISubscriptionPolicyService {
  handle(companyId: string, feature: Feature): Promise<void>;
}
