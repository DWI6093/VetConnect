import { Component, inject, signal, OnInit } from '@angular/core';
import { ServicioAutenticacion } from '../../core/services/auth.service';
import { NegociosServicio } from '../../core/services/negocios.servicio';
import { NegocioColaborador } from '../../core/models/negocio.modelo';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-colaborador-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './colaborador-inicio.component.html',
  styleUrl: './colaborador-inicio.component.css',
})
export class ColaboradorInicioComponente implements OnInit {
  protected readonly servicioAutenticacion = inject(ServicioAutenticacion);
  private readonly negociosServicio = inject(NegociosServicio);

  protected readonly negocios = signal<NegocioColaborador[]>([]);
  protected readonly cargando = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMisNegocios();
  }

  private cargarMisNegocios(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.negociosServicio.obtenerMisNegocios().subscribe({
      next: (negocios) => {
        this.negocios.set(negocios);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus negocios. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  protected obtenerPrimerNombre(): string {
    const sesion = this.servicioAutenticacion.sesionActual();
    if (!sesion || !sesion.nombre) {
      return 'Colaborador';
    }
    return sesion.nombre.split(' ')[0];
  }

  protected alternarEstado(negocio: NegocioColaborador): void {
    const nuevoEstado = negocio.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    this.negociosServicio.cambiarEstadoNegocio(negocio.id_negocio, nuevoEstado).subscribe({
      next: () => {
        // Actualiza el estado localmente sin recargar la página completa
        this.negocios.update((lista) =>
          lista.map((n) =>
            n.id_negocio === negocio.id_negocio ? { ...n, estado: nuevoEstado } : n,
          ),
        );
      },
      error: () => {
        this.error.set('No se pudo cambiar el estado del negocio.');
      },
    });
  }
}
