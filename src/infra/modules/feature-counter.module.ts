import { Module } from '@nestjs/common';
import { FeatureCounterService } from '../services/feature-counter/feature-counter.service';
import { FEATURE_COUNTER_SERVICE } from 'src/application/services/ifeature-counter.service';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: FEATURE_COUNTER_SERVICE, useClass: FeatureCounterService },
  ],
  exports: [FEATURE_COUNTER_SERVICE],
})
export class FeatureCounterModule {}
