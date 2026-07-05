import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ServicioAutenticacion } from '../services/auth.service';

export const guardiaRol: CanActivateFn = (ruta) => {
  const servicioAuth = inject(ServicioAutenticacion);
  const enrutador = inject(Router);

  if (!servicioAuth.estaAutenticado()) {
    return enrutador.createUrlTree(['/auth/login']);
  }

  const rolRequerido = ruta.data['rol'] as 'CLIENTE' | 'COLABORADOR';
  const rolUsuario = servicioAuth.obtenerRol();

  if (rolUsuario === rolRequerido) {
    return true;
  }

  if (rolUsuario === 'CLIENTE') {
    return enrutador.createUrlTree(['/cliente/inicio']);
  }
  return enrutador.createUrlTree(['/colaborador/inicio']);
};
