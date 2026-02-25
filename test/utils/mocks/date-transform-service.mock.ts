import { DateTransformService } from 'src/application/services/date-transform.service';

export const dateTransformServiceMock: DateTransformService = {
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
    .mockImplementation((date: Date) => {
      const cloned = new Date(date);
      cloned.setUTCHours(0, 0, 0, 0);
      return cloned.toISOString();
    })
    .mockReturnValue(new Date().toISOString()),
  toTimezone: jest.fn().mockReturnValue(new Date()),
  toUTC: jest.fn().mockReturnValue(new Date()),
};
