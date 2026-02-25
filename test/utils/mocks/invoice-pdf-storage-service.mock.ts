import { InvoicePdfStorageService } from 'src/application/services/invoice-pdf-storage.service';

export const invoicePdfStorageServiceMock: InvoicePdfStorageService = {
  save: jest.fn(),
  get: jest.fn(),
};
