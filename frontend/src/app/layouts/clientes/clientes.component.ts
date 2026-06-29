import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ServicioAutenticacion } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.modelo';

@Component({
  selector: 'app-layout-clientes',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
})
export class LayoutClientesComponente {
  private readonly servicioAutenticacion = inject(ServicioAutenticacion);
  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly menuPerfilAbierto = signal<boolean>(false);

  constructor() {
    this.usuario.set(this.servicioAutenticacion.obtenerUsuario());
  }

  protected alternarMenuPerfil(): void {
    this.menuPerfilAbierto.update((valor) => !valor);
  }

  protected cerrarSesionUsuario(): void {
    this.servicioAutenticacion.cerrarSesion();
  }
}
