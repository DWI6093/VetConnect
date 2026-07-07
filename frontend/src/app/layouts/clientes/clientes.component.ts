import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ServicioAutenticacion } from '../../core/services/auth.service';
import { ServicioLegal } from '../../core/services/legal.service';

@Component({
  selector: 'app-layout-clientes',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
})
export class LayoutClientesComponente {
  protected readonly servicioAutenticacion = inject(ServicioAutenticacion);
    protected readonly servicioLegal = inject(ServicioLegal);
  protected readonly menuPerfilAbierto = signal<boolean>(false);

  protected alternarMenuPerfil(): void {
    this.menuPerfilAbierto.update((valor) => !valor);
  }
  protected verAvisoPrivacidad(): void { 
    this.servicioLegal.abrirAvisoPrivacidad();
    this.menuPerfilAbierto.set(false);
  }

  protected cerrarSesionUsuario(): void {
    this.servicioAutenticacion.cerrarSesion();
  }
}
