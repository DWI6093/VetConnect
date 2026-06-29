import { Component, signal, inject } from '@angular/core';
import { ServicioAutenticacion } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.modelo';

@Component({
  selector: 'app-cliente-inicio',
  standalone: true,
  templateUrl: './cliente-inicio.component.html',
  styleUrl: './cliente-inicio.component.css',
})
export class ClienteInicioComponente {
  private readonly servicioAutenticacion = inject(ServicioAutenticacion);
  protected readonly usuario = signal<Usuario | null>(null);

  constructor() {
    this.usuario.set(this.servicioAutenticacion.obtenerUsuario());
  }
}
