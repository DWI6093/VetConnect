import { Component, signal, inject } from '@angular/core';
import { ServicioAutenticacion } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.modelo';

@Component({
  selector: 'app-colaborador-inicio',
  standalone: true,
  templateUrl: './colaborador-inicio.component.html',
  styleUrl: './colaborador-inicio.component.css',
})
export class ColaboradorInicioComponente {
  private readonly servicioAutenticacion = inject(ServicioAutenticacion);
  protected readonly usuario = signal<Usuario | null>(null);

  constructor() {
    this.usuario.set(this.servicioAutenticacion.obtenerUsuario());
  }
}
