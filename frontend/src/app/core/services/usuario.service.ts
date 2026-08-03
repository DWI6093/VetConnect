import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { PerfilUsuario, RespuestaCancelacion } from '../models/usuario.modelo';
import { URL_BASE_API } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ServicioUsuario {
  private readonly urlBaseApi = URL_BASE_API;
  private readonly httpCliente = inject(HttpClient);

  obtenerMiPerfil(): Observable<PerfilUsuario> {
    return this.httpCliente.get<PerfilUsuario>(
      `${this.urlBaseApi}/arco/acceso`,
      { withCredentials: true },
    );
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rectificarDatos(datos: Partial<{ nombre: string; apellido: string; correo: string }>): Observable<any> {
    return this.httpCliente.patch(
        `${this.urlBaseApi}/arco/rectificacion`,
        datos,
        { withCredentials: true }
    );
    }
}
