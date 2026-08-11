import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { ServicioAutenticacion } from '../services/auth.service';

export const guardiaEstadoEliminacionChild: CanActivateChildFn = (childRoute) => {
  const authService = inject(ServicioAutenticacion);
  const router = inject(Router);

  const estado = authService.obtenerEstado();
  if (estado !== 'PENDIENTE_ELIMINACION') {
    // Si el estado no es de eliminación pendiente, se permite la navegación normalmente
    return true;
  }

  const rol = authService.obtenerRol();
  const rutaConfiguracion =
    rol === 'CLIENTE' ? '/cliente/configuracion' : '/colaborador/configuracion';

  // Permitir el acceso solo si la ruta hija es exactamente 'configuracion'
  if (childRoute.routeConfig?.path === 'configuracion') {
    return true;
  }

  // Redirigir a configuración para cualquier otra ruta
  return router.createUrlTree([rutaConfiguracion]);
};
