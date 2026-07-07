import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import {
  SesionUsuario,
  RespuestaAuth,
  DatosInicioSesion,
  DatosRegistroCliente,
  DatosRegistroColaborador,
} from '../models/usuario.modelo';

@Injectable({
  providedIn: 'root',
})
export class ServicioAutenticacion {
  private readonly urlBaseApi = window.location.protocol === 'https:' ? 'https://localhost:3000' : 'http://localhost:3000';

  /**
   * Solo almacena información mínima de sesión: el rol.
   * Los tokens son gestionados por el backend via cookies HttpOnly
   * y nunca son accesibles desde JavaScript.
   */
  readonly sesionActual = signal<SesionUsuario | null>(null);

  private readonly httpCliente = inject(HttpClient);
  private readonly enrutador = inject(Router);

  constructor() {
    // La verificación inicial de la sesión se realiza a través de APP_INITIALIZER en app.config.ts
    // para evitar redirecciones prematuras en los guards del enrutador.
  }

  /**
   * Método de inicialización asíncrona invocado por APP_INITIALIZER al arrancar la aplicación.
   * Retorna un observable para que Angular espere a que se complete antes de activar las rutas.
   */
  inicializarSesion(): Observable<SesionUsuario | null> {
    return this.httpCliente
      .get<SesionUsuario>(`${this.urlBaseApi}/auth/me`, { withCredentials: true })
      .pipe(
        tap((info) => {
          this.sesionActual.set(info);
        }),
        catchError(() => {
          this.sesionActual.set(null);
          return of(null);
        })
      );
  }

  /**
   * Consulta al backend si el usuario tiene una sesión activa.
   * Si la cookie jwt_token es válida, el backend devuelve { rol }.
   * Si no, el signal queda en null (no autenticado).
   */
  verificarSesionActiva(): void {
    this.inicializarSesion().subscribe();
  }

  iniciarSesion(credenciales: DatosInicioSesion): Observable<RespuestaAuth> {
    return this.httpCliente
      .post<RespuestaAuth>(
        `${this.urlBaseApi}/auth/login`,
        {
          correo: credenciales.correo,
          password: credenciales.contrasena,
        },
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          // Tras el login exitoso, el backend ya estableció las cookies HttpOnly.
          // Consultamos /auth/me para obtener el rol y actualizar el signal.
          this.verificarSesionActiva();
        }),
        catchError((error) => throwError(() => error))
      );
  }

  registrarCliente(datos: DatosRegistroCliente): Observable<RespuestaAuth> {
    return this.httpCliente
      .post<RespuestaAuth>(
        `${this.urlBaseApi}/auth/registro-cliente`,
        {
          nombre: datos.nombre,
          apellido: datos.apellido,
          correo: datos.correo,
          password: datos.contrasena,
          aceptoAviso: datos.aceptoAviso,
        },
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          // Tras el registro, el backend ya estableció las cookies HttpOnly.
          this.verificarSesionActiva();
        }),
        catchError((error) => throwError(() => error))
      );
  }

  registrarColaborador(datos: DatosRegistroColaborador): Observable<RespuestaAuth> {
    return this.httpCliente
      .post<RespuestaAuth>(
        `${this.urlBaseApi}/auth/registro-colaborador`,
        {
          nombre: datos.nombre,
          apellido: datos.apellido,
          correo: datos.correo,
          password: datos.contrasena,
          aceptoAviso: datos.aceptoAviso,
        },
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          // Tras el registro, el backend ya estableció las cookies HttpOnly.
          this.verificarSesionActiva();
        }),
        catchError((error) => throwError(() => error))
      );
  }

  obtenerUrlAvisoPrivacidad(descargar = true): string {
    return `${this.urlBaseApi}/legal/aviso-privacidad?download=${descargar}`;
  }

  cerrarSesion(): void {
    this.httpCliente
      .post<{ mensaje: string }>(`${this.urlBaseApi}/auth/logout`, {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.sesionActual.set(null);
        this.enrutador.navigate(['/auth/login']);
      });
  }

  /**
   * Llama al endpoint de refresco. El backend lee el refresh_token de la cookie HttpOnly,
   * genera nuevos tokens y establece las nuevas cookies automáticamente.
   * El frontend no manipula tokens en ningún momento.
   */
  refrescarElToken(): Observable<RespuestaAuth> {
    return this.httpCliente.post<RespuestaAuth>(
      `${this.urlBaseApi}/auth/refresh`,
      {},
      { withCredentials: true }
    );
  }

  estaAutenticado(): boolean {
    return this.sesionActual() !== null;
  }

  obtenerRol(): 'CLIENTE' | 'COLABORADOR' | null {
    const sesion = this.sesionActual();
    return sesion ? sesion.rol : null;
  }
}
