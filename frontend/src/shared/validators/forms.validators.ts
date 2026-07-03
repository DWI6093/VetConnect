import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export function textValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null;

  if (/^\d+$/.test(valor)) {
    return { soloNumeros: true };
  }

  const expresionRegular = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]+$/;
  return expresionRegular.test(valor) ? null : { caracteresEspeciales: true };
}

export function spacesValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null;

  if (valor.trim().length === 0) return { soloEspacios: true };
  if (valor !== valor.trim()) return { espaciosEnExtremos: true };
  if (/\s{2,}/.test(valor)) return { multiplesEspacios: true };

  // Más espacios que caracteres
  const letras = valor.replace(/ /g, '').length;
  const espacios = (valor.match(/ /g) || []).length;
  if (espacios >= letras) return { demasiadosEspacios: true };

  return null;
}

export function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null;

  // No permitir espacios internos
  if (/\s/.test(valor)) {
    return { contieneEspacios: true };
  }

  // Solo números
  if (/^\d+$/.test(valor)) {
    return { soloNumeros: true };
  }

  return null;
}

export function onlyWordsValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null;

  const tieneNumeros = /\d/.test(valor);
  return tieneNumeros ? { contieneNumeros: true } : null;
}

// Compuestos

export function nameFieldValidator(): ValidatorFn {
  return Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50), spacesValidator, onlyWordsValidator, textValidator])!;
}

export function passwordFieldValidator(): ValidatorFn {
  return Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(50), passwordValidator, textValidator])!;
}

export function optionalPasswordFieldValidator(): ValidatorFn {
  return Validators.compose([Validators.minLength(6), Validators.maxLength(50), passwordValidator, textValidator])!;
}

export function textFieldValidator(): ValidatorFn {
  return Validators.compose([Validators.required, Validators.minLength(3), spacesValidator, textValidator])!;
}