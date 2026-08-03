import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NegocioCercano } from '../models/negocio.modelo';
import { URL_BASE_API } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class NegociosServicio {
  private readonly httpCliente = inject(HttpClient);
  private readonly urlBaseApi = URL_BASE_API;

  public obtenerNegociosCercanos(latitud: number, longitud: number): Observable<NegocioCercano[]> {
    const parametros = new HttpParams()
      .set('latitud', latitud.toString())
      .set('longitud', longitud.toString());

    return this.httpCliente.get<NegocioCercano[]>(`${this.urlBaseApi}/negocios/cercanos`, {
      params: parametros,
      withCredentials: true
    });
  }
}
