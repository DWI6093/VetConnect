import { Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-contrasena',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputContrasenaComponente),
      multi: true,
    },
  ],
  templateUrl: './input-contrasena.component.html',
  styleUrl: './input-contrasena.component.css',
})
export class InputContrasenaComponente implements ControlValueAccessor {
  @Input() identificador: string = 'contrasena';
  @Input() marcadorDePosicion: string = '••••••••';
  @Input() esInvalido: boolean = false;

  protected mostrarContrasena = signal<boolean>(false);
  protected valorInterno: string = '';
  protected estaDeshabilitado = signal<boolean>(false);

  private alCambiar: (valor: string) => void = () => {};
  private alTocar: () => void = () => {};

  // Métodos requeridos por ControlValueAccessor
  writeValue(valor: any): void {
    this.valorInterno = valor || '';
  }

  registerOnChange(fn: any): void {
    this.alCambiar = fn;
  }

  registerOnTouched(fn: any): void {
    this.alTocar = fn;
  }

  setDisabledState?(estaDeshabilitado: boolean): void {
    this.estaDeshabilitado.set(estaDeshabilitado);
  }

  // Métodos de interacción
  protected alternarVisibilidad(): void {
    if (!this.estaDeshabilitado()) {
      this.mostrarContrasena.update((visible) => !visible);
    }
  }

  protected manejarEntrada(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.valorInterno = input.value;
    this.alCambiar(this.valorInterno);
  }

  protected manejarDesenfoque(): void {
    this.alTocar();
  }
}
