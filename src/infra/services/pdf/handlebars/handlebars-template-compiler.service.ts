import { Injectable } from '@nestjs/common';
import { PdfServiceDTO } from 'src/application/services/pdf.service';
import Handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs';

@Injectable()
export class HandlebarsTemplateCompilerService {
  handle(template: string, data: PdfServiceDTO): string {
    const templatePath = path.resolve(
      __dirname,
      './',
      'templates',
      `${template}.hbs`,
    );

    const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    const compile = Handlebars.compile(htmlTemplate);

    const html = compile(data);

    return html;
  }
}
