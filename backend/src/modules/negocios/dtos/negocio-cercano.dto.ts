export class NegocioCercanoDto {
  id_negocio: number;
  nombre: string;
  direccion: string;
  telefono: string;
  descripcion: string | null;
  latitud: number;
  longitud: number;
  distanciaMetros: number;
}
