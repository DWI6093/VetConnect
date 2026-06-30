import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ServicioAutenticacion } from '../services/auth.service';

export const guardiaAutenticacion: CanActivateFn = () => {
  const servicioAuth = inject(ServicioAutenticacion);
  const enrutador = inject(Router);

  if (servicioAuth.estaAutenticado()) {
    return true;
  }

  enrutador.navigate(['/auth/login']);
  return false;
};
