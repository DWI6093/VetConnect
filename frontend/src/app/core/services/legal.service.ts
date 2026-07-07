import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServicioLegal {
  private readonly urlAvisoPrivacidad = `${environment.apiUrl}/legal/aviso-privacidad`;

  abrirAvisoPrivacidad(): void {
    window.open(this.urlAvisoPrivacidad, '_blank');
  }
}