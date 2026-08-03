import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NegociosRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async buscarCercanos(
    latitud: number,
    longitud: number,
    radioMetros: number,
  ): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT 
        id_negocio,
        nombre,
        direccion,
        telefono,
        descripcion,
        estado,
        ST_Y(ubicacion::geometry) AS latitud,
        ST_X(ubicacion::geometry) AS longitud,
        ST_Distance(
          ubicacion, 
          ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)::geography
        ) AS "distanciaMetros"
      FROM negocio
      WHERE 
        estado = 'ACTIVO' AND
        ST_DWithin(
          ubicacion, 
          ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)::geography, 
          ${radioMetros}
        )
      ORDER BY "distanciaMetros" ASC;
    `;
  }
  async buscarPorNombre(
    nombre: string | undefined,
    pagina: number,
    limite: number,
  ): Promise<any[]> {
    const saltar = (pagina - 1) * limite;
    const filtroNombre = nombre
      ? Prisma.sql`AND nombre ILIKE ${'%' + nombre + '%'}`
      : Prisma.empty;

    return this.prisma.$queryRaw<any[]>`
    SELECT id_negocio, nombre, direccion, telefono, descripcion,
           ST_Y(ubicacion::geometry) AS latitud,
           ST_X(ubicacion::geometry) AS longitud
    FROM negocio
    WHERE estado = 'ACTIVO' ${filtroNombre}
    ORDER BY nombre ASC
    LIMIT ${limite} OFFSET ${saltar};
  `;
  }

  async obtenerPorId(idNegocio: number): Promise<any> {
    const resultado = await this.prisma.$queryRaw<any[]>`
    SELECT id_negocio, id_propietario, nombre, direccion, telefono, descripcion, estado,
           ST_Y(ubicacion::geometry) AS latitud,
           ST_X(ubicacion::geometry) AS longitud
    FROM negocio
    WHERE id_negocio = ${idNegocio};
  `;
    return resultado[0] ?? null;
  }

  async obtenerPorPropietario(idPropietario: number): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
    SELECT n.id_negocio, n.nombre, n.direccion, n.telefono, n.descripcion, n.estado,
           ST_Y(n.ubicacion::geometry) AS latitud,
           ST_X(n.ubicacion::geometry) AS longitud,
           (
             SELECT ruta_imagen FROM imagen_negocio
             WHERE id_negocio = n.id_negocio
             ORDER BY orden ASC LIMIT 1
           ) AS imagen_principal
    FROM negocio n
    WHERE n.id_propietario = ${idPropietario}
    ORDER BY n.fecha_creacion DESC;
  `;
  }

  async crear(
    idPropietario: number,
    datos: {
      nombre: string;
      direccion: string;
      telefono: string;
      descripcion?: string;
      latitud: number;
      longitud: number;
    },
  ): Promise<any> {
    const resultado = await this.prisma.$queryRaw<any[]>`
    INSERT INTO negocio (id_propietario, nombre, direccion, telefono, descripcion, ubicacion, estado)
    VALUES (
      ${idPropietario}, ${datos.nombre}, ${datos.direccion}, ${datos.telefono}, ${datos.descripcion ?? null},
      ST_SetSRID(ST_MakePoint(${datos.longitud}, ${datos.latitud}), 4326)::geography,
      'ACTIVO'
    )
    RETURNING id_negocio, id_propietario, nombre, direccion, telefono, descripcion, estado,
              ST_Y(ubicacion::geometry) AS latitud,
              ST_X(ubicacion::geometry) AS longitud;
  `;
    return resultado[0];
  }

  async actualizar(
    idNegocio: number,
    datos: {
      nombre?: string;
      direccion?: string;
      telefono?: string;
      descripcion?: string;
      latitud?: number;
      longitud?: number;
    },
  ): Promise<any> {
    const asignaciones: Prisma.Sql[] = [];

    if (datos.nombre !== undefined)
      asignaciones.push(Prisma.sql`nombre = ${datos.nombre}`);
    if (datos.direccion !== undefined)
      asignaciones.push(Prisma.sql`direccion = ${datos.direccion}`);
    if (datos.telefono !== undefined)
      asignaciones.push(Prisma.sql`telefono = ${datos.telefono}`);
    if (datos.descripcion !== undefined)
      asignaciones.push(Prisma.sql`descripcion = ${datos.descripcion}`);
    if (datos.latitud !== undefined && datos.longitud !== undefined) {
      asignaciones.push(
        Prisma.sql`ubicacion = ST_SetSRID(ST_MakePoint(${datos.longitud}, ${datos.latitud}), 4326)::geography`,
      );
    }
    asignaciones.push(Prisma.sql`fecha_actualizacion = now()`);

    const resultado = await this.prisma.$queryRaw<any[]>`
    UPDATE negocio
    SET ${Prisma.join(asignaciones, ', ')}
    WHERE id_negocio = ${idNegocio}
    RETURNING id_negocio, id_propietario, nombre, direccion, telefono, descripcion, estado,
              ST_Y(ubicacion::geometry) AS latitud,
              ST_X(ubicacion::geometry) AS longitud;
  `;
    return resultado[0];
  }

  async cambiarEstado(
    idNegocio: number,
    estado: 'ACTIVO' | 'INACTIVO',
  ): Promise<any> {
    const resultado = await this.prisma.$queryRaw<any[]>`
    UPDATE negocio
    SET estado = ${estado}::estado_negocio, fecha_actualizacion = now()
    WHERE id_negocio = ${idNegocio}
    RETURNING id_negocio, estado;
  `;
    return resultado[0];
  }

  async esPropietario(idNegocio: number, idUsuario: number): Promise<boolean> {
    const negocio = await this.obtenerPorId(idNegocio);
    return !!negocio && negocio.id_propietario === idUsuario;
  }

  // ── Horarios (reemplaza todo el set de horarios del negocio) ──
  async reemplazarHorarios(
    idNegocio: number,
    horarios: { dia: string; horaApertura: string; horaCierre: string }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.horario.deleteMany({ where: { id_negocio: idNegocio } });
      await tx.horario.createMany({
        data: horarios.map((h) => ({
          id_negocio: idNegocio,
          dia: h.dia as any,
          hora_apertura: new Date(`1970-01-01T${h.horaApertura}:00`),
          hora_cierre: new Date(`1970-01-01T${h.horaCierre}:00`),
        })),
      });
      return tx.horario.findMany({ where: { id_negocio: idNegocio } });
    });
  }

  // ── Servicios ──
  async crearServicio(
    idNegocio: number,
    datos: { nombre: string; descripcion?: string; precio: number },
  ) {
    return this.prisma.servicio.create({
      data: {
        id_negocio: idNegocio,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio,
      },
    });
  }

  async obtenerServicioConPropietario(idServicio: number) {
    return this.prisma.servicio.findUnique({
      where: { id_servicio: idServicio },
      include: { negocio: { select: { id_propietario: true } } },
    });
  }

  async eliminarServicio(idServicio: number) {
    return this.prisma.servicio.delete({ where: { id_servicio: idServicio } });
  }

  // ── Productos ──
  async crearProducto(
    idNegocio: number,
    datos: {
      nombre: string;
      descripcion?: string;
      precio: number;
      disponible?: boolean;
    },
  ) {
    return this.prisma.producto.create({
      data: {
        id_negocio: idNegocio,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio,
        disponible: datos.disponible ?? true,
      },
    });
  }

  async obtenerProductoConPropietario(idProducto: number) {
    return this.prisma.producto.findUnique({
      where: { id_producto: idProducto },
      include: { negocio: { select: { id_propietario: true } } },
    });
  }

  async eliminarProducto(idProducto: number) {
    return this.prisma.producto.delete({ where: { id_producto: idProducto } });
  }

  // ── Imágenes (RF28: máximo 4 en plan Básico) ──
  async contarImagenes(idNegocio: number) {
    return this.prisma.imagen_negocio.count({
      where: { id_negocio: idNegocio },
    });
  }

  async agregarImagen(
    idNegocio: number,
    rutaImagen: string,
    nombreArchivo: string,
    orden: number,
  ) {
    return this.prisma.imagen_negocio.create({
      data: {
        id_negocio: idNegocio,
        ruta_imagen: rutaImagen,
        nombre_archivo: nombreArchivo,
        orden,
      },
    });
  }

  async obtenerImagenConPropietario(idImagen: number) {
    return this.prisma.imagen_negocio.findUnique({
      where: { id_imagen: idImagen },
      include: { negocio: { select: { id_propietario: true } } },
    });
  }

  async eliminarImagen(idImagen: number) {
    return this.prisma.imagen_negocio.delete({
      where: { id_imagen: idImagen },
    });
  }

  async obtenerDetalleCompleto(idNegocio: number) {
    const base = await this.obtenerPorId(idNegocio); // ya existe, trae lat/lng vía SQL crudo
    if (!base) return null;

    const [horarios, servicios, productos, imagenes] = await Promise.all([
      this.prisma.horario.findMany({ where: { id_negocio: idNegocio } }),
      this.prisma.servicio.findMany({ where: { id_negocio: idNegocio } }),
      this.prisma.producto.findMany({ where: { id_negocio: idNegocio } }),
      this.prisma.imagen_negocio.findMany({
        where: { id_negocio: idNegocio },
        orderBy: { orden: 'asc' },
      }),
    ]);

    return { ...base, horarios, servicios, productos, imagenes };
  }
}
