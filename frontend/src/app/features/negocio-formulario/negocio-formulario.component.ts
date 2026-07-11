import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NegociosServicio } from '../../core/services/negocios.servicio';
import { MapaSelectorComponente, CoordenadasSeleccionadas } from '../../../shared/components/mapa-selector/mapa-selector.component';
import { DiaSemana, Servicio, Producto, ImagenNegocio } from '../../core/models/negocio.modelo';

const DIAS_SEMANA: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

@Component({
  selector: 'app-negocio-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule, MapaSelectorComponente],
  templateUrl: './negocio-formulario.component.html',
  styleUrl: './negocio-formulario.component.css',
})
export class NegocioFormularioComponente
 {
  private readonly negociosServicio = inject(NegociosServicio);
  private readonly router = inject(Router);

  protected readonly dias = DIAS_SEMANA;

  // ── Paso 1: Información básica ───────────
  protected nombre = signal('');
  protected direccion = signal('');
  protected telefono = signal('');
  protected descripcion = signal('');
  protected latitud = signal(20.9153);
  protected longitud = signal(-100.7439);

  protected readonly idNegocio = signal<number | null>(null);
  protected readonly guardandoInfoBasica = signal(false);
  protected readonly errorInfoBasica = signal<string | null>(null);

  protected onUbicacionSeleccionada(coords: CoordenadasSeleccionadas): void {
    this.latitud.set(coords.latitud);
    this.longitud.set(coords.longitud);
  }

  protected guardarInfoBasica(): void {
    if (!this.nombre() || !this.direccion() || !this.telefono()) {
      this.errorInfoBasica.set('Nombre, dirección y teléfono son obligatorios.');
      return;
    }

    this.guardandoInfoBasica.set(true);
    this.errorInfoBasica.set(null);

    this.negociosServicio
      .crearNegocio({
        nombre: this.nombre(),
        direccion: this.direccion(),
        telefono: this.telefono(),
        descripcion: this.descripcion() || undefined,
        latitud: this.latitud(),
        longitud: this.longitud(),
      })
      .subscribe({
        next: (negocio) => {
          this.idNegocio.set(negocio.id_negocio);
          this.guardandoInfoBasica.set(false);
        },
        error: (error) => {
          this.errorInfoBasica.set(error?.error?.message ?? 'No se pudo registrar el negocio.');
          this.guardandoInfoBasica.set(false);
        },
      });
  }

  // ── Paso 2: Horarios ──────────────────────
  protected horarios = signal<{ dia: DiaSemana; horaApertura: string; horaCierre: string }[]>([]);
  protected readonly guardandoHorarios = signal(false);
  protected readonly errorHorarios = signal<string | null>(null);
  protected readonly horariosGuardados = signal(false);

  protected agregarHorario(): void {
    const diasUsados = new Set(this.horarios().map((h) => h.dia));
    const siguienteDia = this.dias.find((d) => !diasUsados.has(d));
    if (!siguienteDia) return; // Ya hay uno por cada día

    this.horarios.update((lista) => [
      ...lista,
      { dia: siguienteDia, horaApertura: '09:00', horaCierre: '18:00' },
    ]);
  }

  protected eliminarFilaHorario(indice: number): void {
    this.horarios.update((lista) => lista.filter((_, i) => i !== indice));
  }

  protected guardarHorarios(): void {
    const idNegocio = this.idNegocio();
    if (!idNegocio || this.horarios().length === 0) return;

    this.guardandoHorarios.set(true);
    this.errorHorarios.set(null);

    this.negociosServicio.actualizarHorarios(idNegocio, this.horarios()).subscribe({
      next: () => {
        this.guardandoHorarios.set(false);
        this.horariosGuardados.set(true);
      },
      error: () => {
        this.errorHorarios.set('No se pudieron guardar los horarios.');
        this.guardandoHorarios.set(false);
      },
    });
  }

  // ── Paso 3: Servicios ─────────────────────
  protected servicios = signal<Servicio[]>([]);
  protected nombreServicio = signal('');
  protected precioServicio = signal<number | null>(null);
  protected readonly errorServicio = signal<string | null>(null);

  protected agregarServicio(): void {
    const idNegocio = this.idNegocio();
    if (!idNegocio || !this.nombreServicio() || this.precioServicio() == null) {
      this.errorServicio.set('Nombre y precio del servicio son obligatorios.');
      return;
    }

    this.negociosServicio
      .crearServicio(idNegocio, { nombre: this.nombreServicio(), precio: this.precioServicio()! })
      .subscribe({
        next: (servicio) => {
          this.servicios.update((lista) => [...lista, servicio]);
          this.nombreServicio.set('');
          this.precioServicio.set(null);
          this.errorServicio.set(null);
        },
        error: () => this.errorServicio.set('No se pudo agregar el servicio.'),
      });
  }

  protected quitarServicio(servicio: Servicio): void {
    this.negociosServicio.eliminarServicio(servicio.id_servicio).subscribe({
      next: () => this.servicios.update((lista) => lista.filter((s) => s.id_servicio !== servicio.id_servicio)),
    });
  }

  // ── Paso 4: Productos ─────────────────────
  protected productos = signal<Producto[]>([]);
  protected nombreProducto = signal('');
  protected precioProducto = signal<number | null>(null);
  protected readonly errorProducto = signal<string | null>(null);

  protected agregarProducto(): void {
    const idNegocio = this.idNegocio();
    if (!idNegocio || !this.nombreProducto() || this.precioProducto() == null) {
      this.errorProducto.set('Nombre y precio del producto son obligatorios.');
      return;
    }

    this.negociosServicio
      .crearProducto(idNegocio, { nombre: this.nombreProducto(), precio: this.precioProducto()! })
      .subscribe({
        next: (producto) => {
          this.productos.update((lista) => [...lista, producto]);
          this.nombreProducto.set('');
          this.precioProducto.set(null);
          this.errorProducto.set(null);
        },
        error: () => this.errorProducto.set('No se pudo agregar el producto.'),
      });
  }

  protected quitarProducto(producto: Producto): void {
    this.negociosServicio.eliminarProducto(producto.id_producto).subscribe({
      next: () => this.productos.update((lista) => lista.filter((p) => p.id_producto !== producto.id_producto)),
    });
  }

  // ── Paso 5: Imágenes ──────────────────────
  protected imagenes = signal<ImagenNegocio[]>([]);
  protected readonly subiendoImagen = signal(false);
  protected readonly errorImagen = signal<string | null>(null);

  protected onSeleccionarImagen(evento: Event): void {
    const idNegocio = this.idNegocio();
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!idNegocio || !archivo) return;

    if (this.imagenes().length >= 4) {
      this.errorImagen.set('El plan Básico permite máximo 4 imágenes.');
      input.value = '';
      return;
    }

    this.subiendoImagen.set(true);
    this.errorImagen.set(null);

    this.negociosServicio.subirImagen(idNegocio, archivo).subscribe({
      next: (imagen) => {
        this.imagenes.update((lista) => [...lista, imagen]);
        this.subiendoImagen.set(false);
        input.value = '';
      },
      error: (error) => {
        this.errorImagen.set(error?.error?.message ?? 'No se pudo subir la imagen.');
        this.subiendoImagen.set(false);
        input.value = '';
      },
    });
  }

  protected quitarImagen(imagen: ImagenNegocio): void {
    this.negociosServicio.eliminarImagen(imagen.id_imagen).subscribe({
      next: () => this.imagenes.update((lista) => lista.filter((i) => i.id_imagen !== imagen.id_imagen)),
    });
  }

  protected finalizarRegistro(): void {
    this.router.navigate(['/colaborador/inicio']);
  }
}