import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ServicioAutenticacion } from '../services/auth.service';

export const guardiaRol: CanActivateFn = (ruta) => {
  const servicioAuth = inject(ServicioAutenticacion);
  const enrutador = inject(Router);

  // Obtener el rol requerido desde los metadatos de la ruta
  const rolRequerido = ruta.data['rol'] as 'CLIENTE' | 'COLABORADOR';
  const rolUsuario = servicioAuth.obtenerRol();

  if (servicioAuth.estaAutenticado() && rolUsuario === rolRequerido) {
    return true;
  }

  // Si está autenticado pero con otro rol, redirigir a su inicio respectivo
  if (servicioAuth.estaAutenticado()) {
    if (rolUsuario === 'CLIENTE') {
      enrutador.navigate(['/cliente/inicio']);
    } else if (rolUsuario === 'COLABORADOR') {
      enrutador.navigate(['/colaborador/inicio']);
    }
  } else {
    enrutador.navigate(['/auth/login']);
  }

  return false;
};
