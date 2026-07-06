import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ServicioAutenticacion } from '../../../core/services/auth.service';
import {
  nameFieldValidator,
  passwordFieldValidator,
  emailFieldValidator,
} from '../../../../shared/validators/forms.validators';
import { InputContrasenaComponente } from '../../../../shared/components/input-contrasena/input-contrasena.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputContrasenaComponente],
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
        nombre: ['', nameFieldValidator()],
        apellido: ['', nameFieldValidator()],
        correo: ['', emailFieldValidator()],
        contrasena: ['', passwordFieldValidator()],
        confirmarContrasena: ['', [this.validarConfirmacionRequerida]],
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


  private validarConfirmacionRequerida(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor || valor.trim() === '') return { required: true };
    return null;
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

    const observable$ =
      this.rolSeleccionado() === 'CLIENTE'
        ? this.servicioAutenticacion.registrarCliente(datosRegistro)
        : this.servicioAutenticacion.registrarColaborador(datosRegistro);

    const rutaDestino =
      this.rolSeleccionado() === 'CLIENTE' ? '/cliente/inicio' : '/colaborador/inicio';

    observable$
      .pipe(finalize(() => this.estaCargando.set(false)))
      .subscribe({
        next: () => {
          this.mensajeExito.set('¡Registro exitoso! Iniciando sesión...');
          setTimeout(() => {
            this.enrutador.navigate([rutaDestino]);
          }, 1500);
        },
        error: (error) => {
          if (error.status === 409) {
            this.mensajeError.set('El correo electrónico ingresado ya está registrado.');
          } else {
            this.mensajeError.set('Ocurrió un error en el registro. Por favor, intente de nuevo.');
          }
        },
      });
  }
}
