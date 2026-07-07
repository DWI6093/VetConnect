import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ServicioAutenticacion } from '../../../app/core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly servicioAutenticacion = inject(ServicioAutenticacion);
  protected readonly menuPerfilAbierto = signal<boolean>(false);

  protected obtenerPrimerNombre(): string {
    const sesion = this.servicioAutenticacion.sesionActual();
    if (!sesion || !sesion.nombre) {
      return '';
    }
    return sesion.nombre.split(' ')[0];
  }

  protected alternarMenuPerfil(): void {
    this.menuPerfilAbierto.update((valor) => !valor);
  }

  protected descargarAvisoPrivacidad(): void {
    window.open(this.servicioAutenticacion.obtenerUrlAvisoPrivacidad(true), '_blank');
  }

  protected cerrarSesionUsuario(): void {
    this.servicioAutenticacion.cerrarSesion();
  }
}

