export interface NegocioCercano {
  id_negocio: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  descripcion: string | null;
  latitud: number;
  longitud: number;
  distanciaMetros: number;
}
export interface NegocioColaborador {
  id_negocio: number;
  nombre: string;
  direccion: string;
  telefono: string;
  descripcion: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  latitud: number;
  longitud: number;
}

export interface NegocioCatalogo {
  id_negocio: number;
  nombre: string;
  direccion: string;
  telefono: string;
  descripcion: string | null;
  latitud: number;
  longitud: number;
}

export interface CrearNegocioPayload {
  nombre: string;
  direccion: string;
  telefono: string;
  descripcion?: string;
  latitud: number;
  longitud: number;
}

export interface ActualizarNegocioPayload {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
}