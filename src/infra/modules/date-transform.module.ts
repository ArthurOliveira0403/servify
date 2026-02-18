import { Module } from '@nestjs/common';
import { DayjsService } from '../services/dayjs/dayjs.service';
import { DATE_TRANSFORM_SERVICE } from 'src/application/services/date-transform.service';

@Module({
  providers: [{ provide: DATE_TRANSFORM_SERVICE, useClass: DayjsService }],
  exports: [DATE_TRANSFORM_SERVICE],
})
export class DateTrasnformModule {}
