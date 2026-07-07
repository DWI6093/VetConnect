import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ServicioAutenticacion } from '../../core/services/auth.service';
import { ServicioLegal } from '../../core/services/legal.service';

@Component({
  selector: 'app-layout-colaboradores',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './colaboradores.component.html',
  styleUrl: './colaboradores.component.css',
})
export class LayoutColaboradoresComponente {
  protected readonly servicioAutenticacion = inject(ServicioAutenticacion);
  protected readonly servicioLegal = inject(ServicioLegal);
  protected readonly sidebarAbierto = signal<boolean>(true);

  protected alternarSidebar(): void {
    this.sidebarAbierto.update((valor) => !valor);
  }

  protected verAvisoPrivacidad(): void { // 👈 nuevo
    this.servicioLegal.abrirAvisoPrivacidad();
  }

  protected cerrarSesionUsuario(): void {
    this.servicioAutenticacion.cerrarSesion();
  }
}
