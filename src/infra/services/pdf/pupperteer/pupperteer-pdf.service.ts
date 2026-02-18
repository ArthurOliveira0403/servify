import { Injectable } from '@nestjs/common';
import {
  PdfService,
  type PdfServiceDTO,
} from 'src/application/services/pdf.service';
import pupperteer from 'puppeteer';
import { HandlebarsTemplateCompilerService } from '../handlebars/handlebars-template-compiler.service';

@Injectable()
export class PupperteertPdfService implements PdfService {
  constructor(private templateCompiler: HandlebarsTemplateCompilerService) {}

  async generate(template: string, data: PdfServiceDTO): Promise<Buffer> {
    const html = this.templateCompiler.handle(template, data);

    const browser = await pupperteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        right: '15mm',
        left: '15mm',
      },
    });

    await browser.close();

    return pdf as Buffer;
  }
}
