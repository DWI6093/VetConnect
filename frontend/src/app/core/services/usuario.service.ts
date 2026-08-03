import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { PerfilUsuario, RespuestaCancelacion } from '../models/usuario.modelo';

type RespuestaRectificacion = Pick<
  PerfilUsuario,
  'id_usuario' | 'nombre' | 'apellido' | 'correo' | 'fecha_actualizacion'
>;

@Injectable({ providedIn: 'root' })
export class ServicioUsuario {
  private readonly urlBaseApi =
    window.location.protocol === 'https:' ? 'https://localhost:3000' : 'http://localhost:3000';
  private readonly httpCliente = inject(HttpClient);

  obtenerMiPerfil(): Observable<PerfilUsuario> {
    return this.httpCliente.get<PerfilUsuario>(`${this.urlBaseApi}/arco/acceso`, {
      withCredentials: true,
    });
  }

  // Inicia el proceso de eliminación (30 días de gracia).
  solicitarEliminacionCuenta(): Observable<RespuestaCancelacion> {
    return this.httpCliente.post<RespuestaCancelacion>(
      `${this.urlBaseApi}/arco/cancelacion`,
      {},
      { withCredentials: true },
    );
  }

  //Revierte la eliminación mientras siga dentro del plazo de gracia.
  restaurarCuenta(): Observable<{ mensaje: string }> {
    return this.httpCliente.post<{ mensaje: string }>(
      `${this.urlBaseApi}/arco/cancelacion/restaurar`,
      {},
      { withCredentials: true },
    );
  }

  rectificarDatos(
    datos: Partial<{ nombre: string; apellido: string; correo: string }>,
  ): Observable<RespuestaRectificacion> {
    return this.httpCliente.patch<RespuestaRectificacion>(
      `${this.urlBaseApi}/arco/rectificacion`,
      datos,
      { withCredentials: true },
    );
  }
}
