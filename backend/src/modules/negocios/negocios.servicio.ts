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
import { CrearServicioDto } from './dtos/crear-servicio.dto';
import { CrearProductoDto } from './dtos/crear-producto.dto';
import { HorarioItemDto } from './dtos/horario.dto';

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
        imagenPrincipal: negocio.imagen_principal ?? null,
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
  private async verificarPropietarioONegar(idNegocio: number, idUsuario: number) {
    const esPropietario = await this.negociosRepositorio.esPropietario(idNegocio, idUsuario);
    if (!esPropietario) {
      throw new ForbiddenException('No tienes permiso para modificar este negocio.');
    }
  }

  // RF17 - Horarios
  async actualizarHorarios(idNegocio: number, idUsuario: number, horarios: HorarioItemDto[]) {
    await this.verificarPropietarioONegar(idNegocio, idUsuario);
    try {
      return await this.negociosRepositorio.reemplazarHorarios(idNegocio, horarios);
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      throw new InternalServerErrorException('No se pudieron guardar los horarios.');
    }
  }

  // RF17 - Servicios
   async crearServicio(idNegocio: number, idUsuario: number, datos: CrearServicioDto) {
    await this.verificarPropietarioONegar(idNegocio, idUsuario);
    try {
      const servicio = await this.negociosRepositorio.crearServicio(idNegocio, datos);
      return { ...servicio, precio: Number(servicio.precio) };
    } catch (error) {
      console.error('Error al agregar servicio:', error);
      throw new InternalServerErrorException('No se pudo agregar el servicio.');
    }
  }

  async eliminarServicio(idServicio: number, idUsuario: number) {
    const servicio = await this.negociosRepositorio.obtenerServicioConPropietario(idServicio);
    if (!servicio) throw new NotFoundException('Servicio no encontrado.');
    if (servicio.negocio.id_propietario !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para eliminar este servicio.');
    }
    await this.negociosRepositorio.eliminarServicio(idServicio);
    return { mensaje: 'Servicio eliminado correctamente.' };
  }

  // RF17 - Productos
   async crearProducto(idNegocio: number, idUsuario: number, datos: CrearProductoDto) {
    await this.verificarPropietarioONegar(idNegocio, idUsuario);
    try {
      const producto = await this.negociosRepositorio.crearProducto(idNegocio, datos);
      return { ...producto, precio: Number(producto.precio) };
    } catch (error) {
      console.error('Error al agregar producto:', error);
      throw new InternalServerErrorException('No se pudo agregar el producto.');
    }
  }

  async eliminarProducto(idProducto: number, idUsuario: number) {
    const producto = await this.negociosRepositorio.obtenerProductoConPropietario(idProducto);
    if (!producto) throw new NotFoundException('Producto no encontrado.');
    if (producto.negocio.id_propietario !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto.');
    }
    await this.negociosRepositorio.eliminarProducto(idProducto);
    return { mensaje: 'Producto eliminado correctamente.' };
  }

  // RF15, RF28 - Imágenes (máximo 4, plan Básico)
  async agregarImagen(idNegocio: number, idUsuario: number, archivo: Express.Multer.File) {
    await this.verificarPropietarioONegar(idNegocio, idUsuario);

    const totalActual = await this.negociosRepositorio.contarImagenes(idNegocio);
    if (totalActual >= 4) {
      throw new ForbiddenException('El plan Básico permite un máximo de 4 imágenes por negocio.');
    }

    try {
      return await this.negociosRepositorio.agregarImagen(
        idNegocio,
        `/uploads/negocios/${archivo.filename}`,
        archivo.originalname,
        totalActual + 1,
      );
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw new InternalServerErrorException('No se pudo subir la imagen.');
    }
  }

  async eliminarImagen(idImagen: number, idUsuario: number) {
    const imagen = await this.negociosRepositorio.obtenerImagenConPropietario(idImagen);
    if (!imagen) throw new NotFoundException('Imagen no encontrada.');
    if (imagen.negocio.id_propietario !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para eliminar esta imagen.');
    }
    await this.negociosRepositorio.eliminarImagen(idImagen);
    return { mensaje: 'Imagen eliminada correctamente.' };
  }
  // AGREGAR dentro de la clase NegociosServicio

  async obtenerDetalleColaborador(idNegocio: number, idUsuario: number) {
    const negocio = await this.negociosRepositorio.obtenerDetalleCompleto(idNegocio);

    if (!negocio) {
      throw new NotFoundException('El negocio solicitado no existe.');
    }
    if (negocio.id_propietario !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para ver este negocio.');
    }

    return {
      ...negocio,
      latitud: Number(negocio.latitud),
      longitud: Number(negocio.longitud),
      servicios: (negocio.servicios ?? []).map((s: any) => ({ ...s, precio: Number(s.precio) })),
      productos: (negocio.productos ?? []).map((p: any) => ({ ...p, precio: Number(p.precio) })),
    };
  }
  
}