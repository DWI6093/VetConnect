import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ServicioAutenticacion } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout-clientes',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
})
export class LayoutClientesComponente {
  protected readonly servicioAutenticacion = inject(ServicioAutenticacion);
  protected readonly menuPerfilAbierto = signal<boolean>(false);

  protected alternarMenuPerfil(): void {
    this.menuPerfilAbierto.update((valor) => !valor);
  }

  protected cerrarSesionUsuario(): void {
    this.servicioAutenticacion.cerrarSesion();
  }
}
