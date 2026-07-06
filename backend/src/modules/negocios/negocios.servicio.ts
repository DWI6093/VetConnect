import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NegociosRepositorio } from './negocios.repositorio';
import { NegocioCercanoDto } from './dtos/negocio-cercano.dto';

@Injectable()
export class NegociosServicio {
  constructor(private readonly negociosRepositorio: NegociosRepositorio) {}

  async obtenerNegociosCercanos(
    latitud: number,
    longitud: number,
    radioMetros: number,
  ): Promise<NegocioCercanoDto[]> {
    try {
      const negocios = await this.negociosRepositorio.buscarCercanos(
        latitud,
        longitud,
        radioMetros,
      );

      return negocios.map((negocio) => ({
        id_negocio: negocio.id_negocio,
        nombre: negocio.nombre,
        direccion: negocio.direccion,
        telefono: negocio.telefono,
        descripcion: negocio.descripcion,
        latitud: Number(negocio.latitud),
        longitud: Number(negocio.longitud),
        distanciaMetros: Number(negocio.distanciaMetros),
      }));
    } catch (error) {
      console.error('Error al obtener negocios cercanos:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error interno al buscar los negocios cercanos. Por favor, intente más tarde.',
      );
    }
  }
}
