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
  private readonly urlBaseApi = 'http://localhost:3000';

  /**
   * Solo almacena información mínima de sesión: el rol.
   * Los tokens son gestionados por el backend via cookies HttpOnly
   * y nunca son accesibles desde JavaScript.
   */
  readonly sesionActual = signal<SesionUsuario | null>(null);

  private readonly httpCliente = inject(HttpClient);
  private readonly enrutador = inject(Router);

  constructor() {
    // Al iniciar la app, verificamos con el backend si hay una sesión activa
    // mediante las cookies HttpOnly que el navegador envía automáticamente.
    this.verificarSesionActiva();
  }

  /**
   * Consulta al backend si el usuario tiene una sesión activa.
   * Si la cookie jwt_token es válida, el backend devuelve { rol }.
   * Si no, el signal queda en null (no autenticado).
   */
  verificarSesionActiva(): void {
    this.httpCliente
      .get<SesionUsuario>(`${this.urlBaseApi}/auth/me`, { withCredentials: true })
      .pipe(
        catchError(() => of(null))
      )
      .subscribe((info) => {
        this.sesionActual.set(info);
      });
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
