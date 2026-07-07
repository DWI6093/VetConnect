import { Controller, Get, Query, StreamableFile, UseGuards } from '@nestjs/common';
import { createReadStream } from 'fs';
import { LegalService } from './legal.service';
import { GuardAutenticacion } from '../auth/guard/autenticacion.guard';



@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}
  @UseGuards(GuardAutenticacion)
  @Get('aviso-privacidad')
  getAvisoPrivacidad(@Query('download') download?: string): StreamableFile {
    const filePath = this.legalService.getAvisoPrivacidadPath();
    const stream = createReadStream(filePath);
    const disposition = download === 'true' ? 'attachment' : 'inline';

    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: `${disposition}; filename="aviso-privacidad.pdf"`,
    });
  }
}
