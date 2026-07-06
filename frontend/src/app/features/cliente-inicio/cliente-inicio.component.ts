import { Component, inject } from '@angular/core';
import { ServicioAutenticacion } from '../../core/services/auth.service';
import { MapaComponente } from '../../../shared/components/mapa/mapa.component';

@Component({
  selector: 'app-cliente-inicio',
  standalone: true,
  imports: [MapaComponente],
  templateUrl: './cliente-inicio.component.html',
  styleUrl: './cliente-inicio.component.css',
})
export class ClienteInicioComponente {
  protected readonly servicioAutenticacion = inject(ServicioAutenticacion);

  protected obtenerPrimerNombre(): string {
    const sesion = this.servicioAutenticacion.sesionActual();
    if (!sesion || !sesion.nombre) {
      return 'Cliente';
    }
    return sesion.nombre.split(' ')[0];
  }
}

