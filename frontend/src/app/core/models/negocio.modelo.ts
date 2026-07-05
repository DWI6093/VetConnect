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
