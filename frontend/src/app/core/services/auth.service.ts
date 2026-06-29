import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  Usuario,
  RespuestaAutenticacion,
  DatosInicioSesion,
  DatosRegistroCliente,
  DatosRegistroColaborador,
} from '../models/usuario.modelo';
import {
  guardarCookie,
  obtenerCookie,
  eliminarCookie,
} from '../utils/cookie.utilidad';

@Injectable({
  providedIn: 'root',
})
export class ServicioAutenticacion {
  private readonly urlBaseApi = 'http://localhost:3000';
  
  // Guardamos el usuario actual usando un Angular Signal para reactividad moderna
  readonly usuarioActual = signal<Usuario | null>(null);

  private readonly httpCliente = inject(HttpClient);
  private readonly enrutador = inject(Router);

  constructor() {
    this.cargarSesionDesdeCookies();
  }

  private cargarSesionDesdeCookies(): void {
    const token = obtenerCookie('jwt_token');
    const usuarioGuardado = obtenerCookie('usuario_sesion');

    if (token && usuarioGuardado) {
      try {
        const datosUsuario: Usuario = JSON.parse(usuarioGuardado);
        this.usuarioActual.set(datosUsuario);
      } catch {
        this.limpiarDatosSesion();
      }
    }
  }

  iniciarSesion(credenciales: DatosInicioSesion): Observable<RespuestaAutenticacion> {
    return this.httpCliente.post<RespuestaAutenticacion>(
      `${this.urlBaseApi}/usuarios/login`,
      {
        correo: credenciales.correo,
        password: credenciales.contrasena,
      }
    ).pipe(
      tap((respuesta) => {
        this.guardarDatosSesion(respuesta.token, respuesta.usuario);
      })
    );
  }

  registrarCliente(datos: DatosRegistroCliente): Observable<RespuestaAutenticacion> {
    return this.httpCliente.post<RespuestaAutenticacion>(
      `${this.urlBaseApi}/usuarios/registro-cliente`,
      {
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo,
        password: datos.contrasena,
      }
    ).pipe(
      tap((respuesta) => {
        this.guardarDatosSesion(respuesta.token, respuesta.usuario);
      })
    );
  }

  registrarColaborador(datos: DatosRegistroColaborador): Observable<Usuario> {
    // El backend tiene un endpoint de colaboradores existente
    return this.httpCliente.post<Usuario>(
      `${this.urlBaseApi}/colaboradores`,
      {
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo,
        password: datos.contrasena,
      }
    );
  }

  cerrarSesion(): void {
    this.limpiarDatosSesion();
    this.enrutador.navigate(['/auth/login']);
  }

  obtenerUsuario(): Usuario | null {
    return this.usuarioActual();
  }

  estaAutenticado(): boolean {
    return this.usuarioActual() !== null && obtenerCookie('jwt_token') !== null;
  }

  obtenerRol(): 'CLIENTE' | 'COLABORADOR' | null {
    const usuario = this.usuarioActual();
    return usuario ? usuario.rol : null;
  }

  private guardarDatosSesion(token: string, usuario: Usuario): void {
    // Guardamos las cookies válidas por 1 día
    guardarCookie('jwt_token', token, 1);
    guardarCookie('usuario_sesion', JSON.stringify(usuario), 1);
    this.usuarioActual.set(usuario);
  }

  private limpiarDatosSesion(): void {
    eliminarCookie('jwt_token');
    eliminarCookie('usuario_sesion');
    this.usuarioActual.set(null);
  }
}
