import { Component, inject } from '@angular/core';
import { ServicioAutenticacion } from '../../core/services/auth.service';

@Component({
  selector: 'app-colaborador-inicio',
  standalone: true,
  templateUrl: './colaborador-inicio.component.html',
  styleUrl: './colaborador-inicio.component.css',
})
export class ColaboradorInicioComponente {
  protected readonly servicioAutenticacion = inject(ServicioAutenticacion);
}
