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
import { HorarioPayload, Servicio, Producto, ImagenNegocio } from '../models/negocio.modelo';

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
  // ── Horarios ──────────────────────────────
public actualizarHorarios(idNegocio: number, horarios: HorarioPayload[]): Observable<HorarioPayload[]> {
  return this.httpCliente.put<HorarioPayload[]>(
    `${this.urlBaseApi}/negocios/${idNegocio}/horarios`,
    { horarios },
    { withCredentials: true }
  );
}

// ── Servicios ─────────────────────────────
public crearServicio(idNegocio: number, datos: { nombre: string; descripcion?: string; precio: number }): Observable<Servicio> {
  return this.httpCliente.post<Servicio>(`${this.urlBaseApi}/negocios/${idNegocio}/servicios`, datos, { withCredentials: true });
}

public eliminarServicio(idServicio: number): Observable<{ mensaje: string }> {
  return this.httpCliente.delete<{ mensaje: string }>(`${this.urlBaseApi}/negocios/servicios/${idServicio}`, { withCredentials: true });
}

// ── Productos ─────────────────────────────
public crearProducto(idNegocio: number, datos: { nombre: string; descripcion?: string; precio: number; disponible?: boolean }): Observable<Producto> {
  return this.httpCliente.post<Producto>(`${this.urlBaseApi}/negocios/${idNegocio}/productos`, datos, { withCredentials: true });
}

public eliminarProducto(idProducto: number): Observable<{ mensaje: string }> {
  return this.httpCliente.delete<{ mensaje: string }>(`${this.urlBaseApi}/negocios/productos/${idProducto}`, { withCredentials: true });
}

// ── Imágenes ──────────────────────────────
public subirImagen(idNegocio: number, archivo: File): Observable<ImagenNegocio> {
  const formData = new FormData();
  formData.append('imagen', archivo);
  return this.httpCliente.post<ImagenNegocio>(`${this.urlBaseApi}/negocios/${idNegocio}/imagenes`, formData, { withCredentials: true });
}

public eliminarImagen(idImagen: number): Observable<{ mensaje: string }> {
  return this.httpCliente.delete<{ mensaje: string }>(`${this.urlBaseApi}/negocios/imagenes/${idImagen}`, { withCredentials: true });
}
}
