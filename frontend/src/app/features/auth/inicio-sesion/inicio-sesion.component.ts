import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '../../../core/services/auth.service';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css',
})
export class InicioSesionComponente {
  private readonly constructorFormularios = inject(FormBuilder);
  private readonly servicioAutenticacion = inject(ServicioAutenticacion);
  private readonly enrutador = inject(Router);

  protected readonly formularioInicioSesion: FormGroup;
  protected readonly mensajeError = signal<string | null>(null);
  protected readonly estaCargando = signal<boolean>(false);

  constructor() {
    this.formularioInicioSesion = this.constructorFormularios.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  protected iniciarSesionUsuario(): void {
    if (this.formularioInicioSesion.invalid) {
      this.formularioInicioSesion.markAllAsTouched();
      return;
    }

    this.estaCargando.set(true);
    this.mensajeError.set(null);

    const credenciales = {
      correo: this.formularioInicioSesion.get('correo')?.value,
      contrasena: this.formularioInicioSesion.get('contrasena')?.value,
    };

    this.servicioAutenticacion.iniciarSesion(credenciales).subscribe({
      next: () => {
        this.estaCargando.set(false);
        // El rol se carga asincrónicamente desde /auth/me via verificarSesionActiva().
        // breve momento para que el signal se actualice antes de redirigir.
        setTimeout(() => {
          const rol = this.servicioAutenticacion.obtenerRol();
          if (rol === 'CLIENTE') {
            this.enrutador.navigate(['/cliente/inicio']);
          } else if (rol === 'COLABORADOR') {
            this.enrutador.navigate(['/colaborador/inicio']);
          }
        }, 300);
      },
      error: (error) => {
        this.estaCargando.set(false);
        if (error.status === 401) {
          this.mensajeError.set('Correo electrónico o contraseña incorrectos.');
        } else {
          this.mensajeError.set('Ocurrió un error al intentar iniciar sesión. Por favor, intente más tarde.');
        }
      },
    });
  }
}
