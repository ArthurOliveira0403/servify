import { PdfService } from 'src/application/services/pdf.service';

export const pdfServiceMock: PdfService = {
  generate: jest.fn(),
};
