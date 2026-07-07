import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ServicioAutenticacion } from '../../../core/services/auth.service';
import { InputContrasenaComponente } from '../../../../shared/components/input-contrasena/input-contrasena.component';
import { emailFieldValidator, passwordFieldValidator } from '../../../../shared/validators/forms.validators';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputContrasenaComponente],
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
      correo: ['', emailFieldValidator()],
      contrasena: ['', passwordFieldValidator()],
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

    this.servicioAutenticacion
      .iniciarSesion(credenciales)
      .pipe(finalize(() => this.estaCargando.set(false)))
      .subscribe({
        next: () => {
          // El rol se carga asíncronamente desde /auth/me via verificarSesionActiva().
          // breve momento para que el signal se actualice antes de redirigir.
          setTimeout(() => {
            const rol = this.servicioAutenticacion.obtenerRol();
            const estado = this.servicioAutenticacion.obtenerEstado();
            if (rol === 'CLIENTE') {
              if (estado === 'PENDIENTE_ELIMINACION') {
                this.enrutador.navigate(['/cliente/configuracion']);
              } else {
                this.enrutador.navigate(['/cliente/inicio']);
              }
            } else if (rol === 'COLABORADOR') {
              if (estado === 'PENDIENTE_ELIMINACION') {
                this.enrutador.navigate(['/colaborador/configuracion']);
              } else {
              this.enrutador.navigate(['/colaborador/inicio']);
              }
            }
          }, 300);
        },
        error: (error) => {
          if (error.status === 401 || error.status === 0) {
            this.mensajeError.set('Correo o Contraseña incorrectos');
          } else {
            this.mensajeError.set('Ocurrió un error al intentar iniciar sesión. Por favor, intente más tarde.');
          }
        },
      });
  }
}
