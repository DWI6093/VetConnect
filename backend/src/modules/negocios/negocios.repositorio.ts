import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
}
