import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioUsuario } from '../../../app/core/services/usuario.service';
import type { PerfilUsuario } from '../../../app/core/models/usuario.modelo';
import { ServicioAutenticacion } from '../../../app/core/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.css',
})
export class CuentaComponente implements OnInit {
  private readonly servicioUsuario = inject(ServicioUsuario);
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly router = inject(Router);  
  private readonly fb = inject(FormBuilder);

  readonly perfil = signal<PerfilUsuario | null>(null);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);

  // Modal de eliminación
  readonly mostrarModalEliminar = signal(false);
  readonly eliminando = signal(false);
  readonly errorEliminacion = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  // Restaurar cuenta (recuperación dentro del plazo)
  readonly restaurando = signal(false);
  readonly errorRestaurar = signal<string | null>(null);

  formularioRectificacion!: FormGroup;
  readonly actualizando = signal(false);
  readonly errorRectificacion = signal<string | null>(null);
  readonly mensajeExitoRectificacion = signal<string | null>(null);
  // Guardamos los valores originales para comparar cambios
  private valoresOriginales: Partial<PerfilUsuario> = {};

  ngOnInit(): void {
    this.cargarPerfil();
  }

  private cargarPerfil(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.servicioUsuario.obtenerMiPerfil().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.cargando.set(false);
        this.inicializarFormulario(perfil);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar la información de tu perfil.');
        this.cargando.set(false);
      },
    });
  }

  private inicializarFormulario(perfil: PerfilUsuario): void {
    // Guardamos los valores originales para comparar
    this.valoresOriginales = {
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      correo: perfil.correo,
    };

    this.formularioRectificacion = this.fb.group({
      nombre: [perfil.nombre, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      apellido: [perfil.apellido, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      correo: [perfil.correo, [Validators.required, Validators.email, Validators.maxLength(50)]],
    });
  }

  get formularioHaCambiado(): boolean {
    if (!this.formularioRectificacion) return false;
    const valoresActuales = this.formularioRectificacion.value;
    return (
      valoresActuales.nombre !== this.valoresOriginales.nombre ||
      valoresActuales.apellido !== this.valoresOriginales.apellido ||
      valoresActuales.correo !== this.valoresOriginales.correo
    );
  }

  actualizarDatos(): void {
    if (this.formularioRectificacion.invalid || !this.formularioHaCambiado) return;

    this.actualizando.set(true);
    this.errorRectificacion.set(null);
    this.mensajeExitoRectificacion.set(null);

    // Construir el objeto con los campos que han cambiado (opcional)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cambios: any = {};
    const valores = this.formularioRectificacion.value;
    if (valores.nombre !== this.valoresOriginales.nombre) cambios.nombre = valores.nombre;
    if (valores.apellido !== this.valoresOriginales.apellido) cambios.apellido = valores.apellido;
    if (valores.correo !== this.valoresOriginales.correo) cambios.correo = valores.correo;

    this.servicioUsuario.rectificarDatos(cambios).subscribe({
      next: (respuesta) => {
        this.actualizando.set(false);
        this.mensajeExitoRectificacion.set('¡Tus datos se actualizaron correctamente!');
        // Actualizar el perfil con los nuevos datos
        const perfilActual = this.perfil();
        if (perfilActual) {
          const nuevoPerfil: PerfilUsuario = {
            ...perfilActual,
            ...respuesta, // el backend devuelve el usuario actualizado
          };
          this.perfil.set(nuevoPerfil);
          // Actualizar valores originales y reiniciar el formulario con los nuevos datos
          this.inicializarFormulario(nuevoPerfil);
        }
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => this.mensajeExitoRectificacion.set(null), 3000);
      },
      error: (err) => {
        this.actualizando.set(false);
        this.errorRectificacion.set(
          err?.error?.message ?? 'Ocurrió un error al actualizar tus datos.'
        );
        // Ocultar error después de 5 segundos
        setTimeout(() => this.errorRectificacion.set(null), 5000);
      },
    });
  }

  abrirModalEliminar(): void {
    this.errorEliminacion.set(null);
    this.mostrarModalEliminar.set(true);
  }

  cerrarModalEliminar(): void {
    if (this.eliminando()) return;
    this.mostrarModalEliminar.set(false);
  }

  confirmarEliminacion(): void {
    this.eliminando.set(true);
    this.errorEliminacion.set(null);

    this.servicioUsuario.solicitarEliminacionCuenta().subscribe({
      next: (respuesta) => {
        this.eliminando.set(false);
        this.mostrarModalEliminar.set(false);
        this.mensajeExito.set(respuesta.mensaje);
        // El backend ya invalidó el refresh token, así que cerramos sesión localmente.
        setTimeout(() => this.servicioAuth.cerrarSesion(), 3000);
      },
      error: (err) => {
        this.eliminando.set(false);
        this.errorEliminacion.set(
          err?.error?.message ?? 'Ocurrió un error al procesar tu solicitud.',
        );
      },
    });
  }

  restaurarCuenta(): void {
    this.restaurando.set(true);
    this.errorRestaurar.set(null);

    this.servicioUsuario.restaurarCuenta().subscribe({
      next: () => {
        this.restaurando.set(false);
        this.cargarPerfil();
        this.servicioAuth.verificarSesionActiva();
      },
      error: (err) => {
        this.restaurando.set(false);
        this.errorRestaurar.set(
          err?.error?.message ?? 'No se pudo cancelar la solicitud de eliminación.',
        );
      },
    });
  }
}