import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { ServicioAutenticacion } from '../services/auth.service';

let estaRefrescandoToken = false;
const tokenRefrescado$ = new BehaviorSubject<boolean>(false);

/**
 * Interceptor de autenticación basado en cookies HttpOnly.
 *
 * El navegador envía las cookies automáticamente gracias a `withCredentials: true`.
 * Este interceptor solo maneja los errores 401 para intentar refrescar la sesión.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const servicioAuth = inject(ServicioAutenticacion);

  // Adjuntar withCredentials para que el navegador envíe las cookies HttpOnly automáticamente
  const solicitudConCredenciales = req.clone({ withCredentials: true });

  return next(solicitudConCredenciales).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const esRutaAutenticacion =
          req.url.includes('/auth/login') ||
          req.url.includes('/auth/registro-cliente') ||
          req.url.includes('/auth/registro-colaborador') ||
          req.url.includes('/auth/refresh') ||
          req.url.includes('/auth/logout');

        if (esRutaAutenticacion) {
          return throwError(() => error);
        }

        const mensajeError = error.error?.message;

        // Si el token fue modificado, malformado o es completamente inválido (pero no expirado),
        // se saca inmediatamente al usuario de la sesión para proteger la app.
        if (
          mensajeError === 'Token modificado' ||
          mensajeError === 'Token malformado' ||
          mensajeError === 'Token inválido' ||
          mensajeError === 'Token no proporcionado'
        ) {
          servicioAuth.cerrarSesion();
          return throwError(() => error);
        }

        // Si el error es debido a expiración,  refrescar la sesión
        return manejarError401(req, next, servicioAuth);
      }
      return throwError(() => error);
    })
  );
};

function manejarError401(
  solicitud: HttpRequest<unknown>,
  siguiente: HttpHandlerFn,
  servicioAuth: ServicioAutenticacion
): Observable<HttpEvent<unknown>> {
  // Si ya hay un proceso de refresco activo, se espera a que termine
  if (estaRefrescandoToken) {
    return tokenRefrescado$.pipe(
      filter((exito): exito is true => exito === true),
      take(1),
      switchMap(() => {
        // Reintentar la solicitud original; el navegador enviará la nueva cookie automáticamente
        return siguiente(solicitud.clone({ withCredentials: true }));
      })
    );
  }

  estaRefrescandoToken = true;
  tokenRefrescado$.next(false);

  return servicioAuth.refrescarElToken().pipe(
    switchMap(() => {
      estaRefrescandoToken = false;
      tokenRefrescado$.next(true);
      // Reintentar la solicitud original con las nuevas cookies ya establecidas por el backend
      return siguiente(solicitud.clone({ withCredentials: true }));
    }),
    catchError((errorRefresco) => {
      estaRefrescandoToken = false;
      tokenRefrescado$.next(false);
      servicioAuth.cerrarSesion();
      return throwError(() => errorRefresco);
    })
  );
}
