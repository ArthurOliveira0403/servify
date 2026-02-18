import { Injectable } from '@nestjs/common';
import { DateTransformService } from 'src/application/services/date-transform.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class DayjsService implements DateTransformService {
  private format: string = 'DD/MM/YYYY HH:mm:ss';

  nowUTC(): Date {
    return dayjs.utc().toDate();
  }

  toUTC(date: Date | string, tz: string = 'UTC'): Date {
    return dayjs.tz(date, tz).utc().toDate();
  }

  toTimezone(date: Date | string, tz: string): Date {
    return dayjs.utc(date).tz(tz).toDate();
  }

  formatInTimezone(date: Date | string, tz: string): string {
    return dayjs.utc(date).tz(tz).format(this.format);
  }

  formatInTimezoneWithoutHour(date: Date, tz: string): string {
    return dayjs.utc(date).tz(tz).format('DD/MM/YYYY');
  }

  addMonths(date: Date | string, months: number): Date {
    return dayjs.utc(date).add(months, 'month').toDate();
  }

  addYears(date: Date | string, years: number): Date {
    return dayjs.utc(date).add(years, 'year').toDate();
  }
}
