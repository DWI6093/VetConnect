import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NegocioCercano,
  NegocioColaborador,
  NegocioCatalogo,
  CrearNegocioPayload,
  ActualizarNegocioPayload,
} from '../models/negocio.modelo';

@Injectable({
  providedIn: 'root'
})
export class NegociosServicio {
  private readonly httpCliente = inject(HttpClient);
  private readonly urlBaseApi = window.location.protocol === 'https:' ? 'https://localhost:3000' : 'http://localhost:3000';

  public obtenerNegociosCercanos(latitud: number, longitud: number): Observable<NegocioCercano[]> {
    const parametros = new HttpParams()
      .set('latitud', latitud.toString())
      .set('longitud', longitud.toString());

    return this.httpCliente.get<NegocioCercano[]>(`${this.urlBaseApi}/negocios/cercanos`, {
      params: parametros,
      withCredentials: true
    });
  }

  public obtenerCatalogo(nombre?: string, pagina = 1, limite = 20): Observable<NegocioCatalogo[]> {
    let parametros = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (nombre) {
      parametros = parametros.set('nombre', nombre);
    }

    return this.httpCliente.get<NegocioCatalogo[]>(`${this.urlBaseApi}/negocios/catalogo`, {
      params: parametros,
      withCredentials: true
    });
  }

  public obtenerMisNegocios(): Observable<NegocioColaborador[]> {
    return this.httpCliente.get<NegocioColaborador[]>(`${this.urlBaseApi}/negocios/mis-negocios`, {
      withCredentials: true
    });
  }

  public crearNegocio(datos: CrearNegocioPayload): Observable<NegocioColaborador> {
    return this.httpCliente.post<NegocioColaborador>(`${this.urlBaseApi}/negocios`, datos, {
      withCredentials: true
    });
  }

  public actualizarNegocio(idNegocio: number, datos: ActualizarNegocioPayload): Observable<NegocioColaborador> {
    return this.httpCliente.patch<NegocioColaborador>(`${this.urlBaseApi}/negocios/${idNegocio}`, datos, {
      withCredentials: true
    });
  }

  public cambiarEstadoNegocio(idNegocio: number, estado: 'ACTIVO' | 'INACTIVO'): Observable<{ id_negocio: number; estado: string }> {
    return this.httpCliente.patch<{ id_negocio: number; estado: string }>(
      `${this.urlBaseApi}/negocios/${idNegocio}/estado`,
      { estado },
      { withCredentials: true }
    );
  }
}
