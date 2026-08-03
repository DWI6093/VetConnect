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
  imagenPrincipal?: string | null;
}

export interface HorarioNegocio {
  dia: DiaSemana;
  hora_apertura: string;
  hora_cierre: string;
}

export interface NegocioDetalleColaborador extends NegocioColaborador {
  horarios: HorarioNegocio[];
  servicios: Servicio[];
  productos: Producto[];
  imagenes: ImagenNegocio[];
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
export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO';

export interface HorarioPayload {
  dia: DiaSemana;
  horaApertura: string;
  horaCierre: string;
}

export interface Servicio {
  id_servicio: number;
  id_negocio: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
}

export interface Producto {
  id_producto: number;
  id_negocio: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
}

export interface ImagenNegocio {
  id_imagen: number;
  id_negocio: number;
  ruta_imagen: string;
  nombre_archivo: string;
  orden: number;
  imagenPrincipal?: string | null;
}
