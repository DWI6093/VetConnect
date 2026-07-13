import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { NegociosRepositorio } from './negocios.repositorio';
import { NegocioCercanoDto } from './dtos/negocio-cercano.dto';
import { CrearNegocioDto } from './dtos/crear-negocio.dto';
import { ActualizarNegocioDto } from './dtos/actualizar-negocio.dto';

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

  async obtenerCatalogo(nombre: string | undefined, pagina: number, limite: number) {
    try {
      const negocios = await this.negociosRepositorio.buscarPorNombre(nombre, pagina, limite);
      return negocios.map((negocio) => ({
        id_negocio: negocio.id_negocio,
        nombre: negocio.nombre,
        direccion: negocio.direccion,
        telefono: negocio.telefono,
        descripcion: negocio.descripcion,
        latitud: Number(negocio.latitud),
        longitud: Number(negocio.longitud),
      }));
    } catch (error) {
      console.error('Error al obtener catálogo de negocios:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error interno al buscar el catálogo de negocios.',
      );
    }
  }

  async obtenerMisNegocios(idPropietario: number) {
    try {
      const negocios = await this.negociosRepositorio.obtenerPorPropietario(idPropietario);
      return negocios.map((negocio) => ({
        id_negocio: negocio.id_negocio,
        nombre: negocio.nombre,
        direccion: negocio.direccion,
        telefono: negocio.telefono,
        descripcion: negocio.descripcion,
        estado: negocio.estado,
        latitud: Number(negocio.latitud),
        longitud: Number(negocio.longitud),
      }));
    } catch (error) {
      console.error('Error al obtener negocios del propietario:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error interno al obtener tus negocios.',
      );
    }
  }

  async crearNegocio(idPropietario: number, datos: CrearNegocioDto) {
    try {
      const negocio = await this.negociosRepositorio.crear(idPropietario, datos);
      return {
        ...negocio,
        latitud: Number(negocio.latitud),
        longitud: Number(negocio.longitud),
      };
    } catch (error) {
      console.error('Error al crear negocio:', error);
      throw new InternalServerErrorException('Ocurrió un error interno al crear el negocio.');
    }
  }

  async actualizarNegocio(
    idNegocio: number,
    idUsuario: number,
    datos: ActualizarNegocioDto,
  ) {
    const negocioExistente = await this.negociosRepositorio.obtenerPorId(idNegocio);

    if (!negocioExistente) {
      throw new NotFoundException('El negocio solicitado no existe.');
    }

    if (negocioExistente.id_propietario !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para modificar este negocio.');
    }

    try {
      const actualizado = await this.negociosRepositorio.actualizar(idNegocio, datos);
      return {
        ...actualizado,
        latitud: Number(actualizado.latitud),
        longitud: Number(actualizado.longitud),
      };
    } catch (error) {
      console.error('Error al actualizar negocio:', error);
      throw new InternalServerErrorException('Ocurrió un error interno al actualizar el negocio.');
    }
  }

  async cambiarEstadoNegocio(
    idNegocio: number,
    idUsuario: number,
    estado: 'ACTIVO' | 'INACTIVO',
  ) {
    const negocioExistente = await this.negociosRepositorio.obtenerPorId(idNegocio);

    if (!negocioExistente) {
      throw new NotFoundException('El negocio solicitado no existe.');
    }

    if (negocioExistente.id_propietario !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para modificar este negocio.');
    }

    try {
      return await this.negociosRepositorio.cambiarEstado(idNegocio, estado);
    } catch (error) {
      console.error('Error al cambiar estado del negocio:', error);
      throw new InternalServerErrorException('Ocurrió un error interno al cambiar el estado del negocio.');
    }
  }
}