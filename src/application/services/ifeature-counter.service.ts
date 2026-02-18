import { Feature } from 'src/domain/entities/subscription';

export const FEATURE_COUNTER_SERVICE = 'FEATURE_COUNTER_SERVICE';

export interface IFeatureCounterService {
  handle(feature: Feature, companyId: string): Promise<number>;
}
