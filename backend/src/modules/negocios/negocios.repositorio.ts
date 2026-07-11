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
  const filtroNombre = nombre ? Prisma.sql`AND nombre ILIKE ${'%' + nombre + '%'}` : Prisma.empty;

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

async obtenerPorId(idNegocio: number): Promise<any | null> {
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
    SELECT id_negocio, nombre, direccion, telefono, descripcion, estado,
           ST_Y(ubicacion::geometry) AS latitud,
           ST_X(ubicacion::geometry) AS longitud
    FROM negocio
    WHERE id_propietario = ${idPropietario}
    ORDER BY fecha_creacion DESC;
  `;
}

async crear(idPropietario: number, datos: {
  nombre: string; direccion: string; telefono: string;
  descripcion?: string; latitud: number; longitud: number;
}): Promise<any> {
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

async actualizar(idNegocio: number, datos: {
  nombre?: string; direccion?: string; telefono?: string;
  descripcion?: string; latitud?: number; longitud?: number;
}): Promise<any> {
  const asignaciones: Prisma.Sql[] = [];

  if (datos.nombre !== undefined) asignaciones.push(Prisma.sql`nombre = ${datos.nombre}`);
  if (datos.direccion !== undefined) asignaciones.push(Prisma.sql`direccion = ${datos.direccion}`);
  if (datos.telefono !== undefined) asignaciones.push(Prisma.sql`telefono = ${datos.telefono}`);
  if (datos.descripcion !== undefined) asignaciones.push(Prisma.sql`descripcion = ${datos.descripcion}`);
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

async cambiarEstado(idNegocio: number, estado: 'ACTIVO' | 'INACTIVO'): Promise<any> {
  const resultado = await this.prisma.$queryRaw<any[]>`
    UPDATE negocio
    SET estado = ${estado}::estado_negocio, fecha_actualizacion = now()
    WHERE id_negocio = ${idNegocio}
    RETURNING id_negocio, estado;
  `;
  return resultado[0];
}
}
