import { DateTransformService } from 'src/application/services/date-transform.service';

export const dateTransformMock: DateTransformService = {
  nowUTC: jest.fn().mockReturnValue(new Date()),
  addMonths: jest.fn().mockImplementation((date: Date, months: number) => {
    return new Date(new Date(date).setMonth(date.getMonth() + months));
  }),
  addYears: jest.fn().mockImplementation((date: Date, years: number) => {
    return new Date(new Date(date).setFullYear(date.getFullYear() + years));
  }),
  formatInTimezone: jest.fn().mockReturnValue(new Date().toISOString()),
  formatInTimezoneWithoutHour: jest
    .fn()
    .mockReturnValue(new Date().toISOString()),
  toTimezone: jest.fn().mockReturnValue(new Date()),
  toUTC: jest.fn().mockReturnValue(new Date()),
};
