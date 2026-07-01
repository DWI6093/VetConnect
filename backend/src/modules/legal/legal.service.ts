import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class LegalService {
  getAvisoPrivacidadPath(): string {
    const filePath = join(process.cwd(), 'public', 'documentos', 'aviso-privacidad.pdf');
    if (!existsSync(filePath)) {
      throw new NotFoundException('El aviso de privacidad no está disponible en este momento.');
    }
    return filePath;
  }
}