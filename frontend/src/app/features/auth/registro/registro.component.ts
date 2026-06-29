import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponente {
  private readonly constructorFormularios = inject(FormBuilder);
  private readonly servicioAutenticacion = inject(ServicioAutenticacion);
  private readonly enrutador = inject(Router);

  protected readonly formularioRegistro: FormGroup;
  protected readonly rolSeleccionado = signal<'CLIENTE' | 'COLABORADOR'>('CLIENTE');
  protected readonly mensajeError = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);
  protected readonly estaCargando = signal<boolean>(false);

  constructor() {
    this.formularioRegistro = this.constructorFormularios.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        correo: ['', [Validators.required, Validators.email]],
        contrasena: ['', [Validators.required, Validators.minLength(6)]],
        confirmarContrasena: ['', [Validators.required]],
      },
      {
        validators: this.validarContrasenasCoincidan,
      }
    );
  }

  private validarContrasenasCoincidan(control: AbstractControl): ValidationErrors | null {
    const contrasena = control.get('contrasena')?.value;
    const confirmarContrasena = control.get('confirmarContrasena')?.value;
    return contrasena === confirmarContrasena ? null : { contrasenasNoCoinciden: true };
  }

  protected seleccionarRol(rol: 'CLIENTE' | 'COLABORADOR'): void {
    this.rolSeleccionado.set(rol);
    this.mensajeError.set(null);
  }

  protected registrarUsuario(): void {
    if (this.formularioRegistro.invalid) {
      this.formularioRegistro.markAllAsTouched();
      return;
    }

    this.estaCargando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    const datosRegistro = {
      nombre: this.formularioRegistro.get('nombre')?.value,
      apellido: this.formularioRegistro.get('apellido')?.value,
      correo: this.formularioRegistro.get('correo')?.value,
      contrasena: this.formularioRegistro.get('contrasena')?.value,
    };

    if (this.rolSeleccionado() === 'CLIENTE') {
      this.servicioAutenticacion.registrarCliente(datosRegistro).subscribe({
        next: () => {
          this.estaCargando.set(false);
          this.mensajeExito.set('¡Registro exitoso! Iniciando sesión...');
          // Después de 1.5 segundos redirigir al inicio del cliente
          setTimeout(() => {
            this.enrutador.navigate(['/cliente/inicio']);
          }, 1500);
        },
        error: (error) => {
          this.estaCargando.set(false);
          if (error.status === 409) {
            this.mensajeError.set('El correo electrónico ingresado ya está registrado.');
          } else {
            this.mensajeError.set('Ocurrió un error en el registro. Por favor, intente de nuevo.');
          }
        },
      });
    } else {
      this.servicioAutenticacion.registrarColaborador(datosRegistro).subscribe({
        next: () => {
          this.estaCargando.set(false);
          this.mensajeExito.set('¡Registro exitoso! Iniciando sesión...');
          // Después de 1.5 segundos redirigir al inicio del colaborador
          setTimeout(() => {
            this.enrutador.navigate(['/colaborador/inicio']);
          }, 1500);
        },
        error: (error) => {
          this.estaCargando.set(false);
          if (error.status === 409) {
            this.mensajeError.set('El correo electrónico ingresado ya está registrado.');
          } else {
            this.mensajeError.set('Ocurrió un error en el registro. Por favor, intente de nuevo.');
          }
        },
      });
    }
  }
}
