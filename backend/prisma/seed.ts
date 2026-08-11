import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Iniciando sembrado de datos de negocios de prueba...');

  try {
    // 1. Crear o buscar usuario propietario de prueba
    let usuarioPropietario = await prisma.usuario.findUnique({
      where: { correo: 'propietario.prueba@vetconnect.com' },
    });

    if (!usuarioPropietario) {
      usuarioPropietario = await prisma.usuario.create({
        data: {
          nombre: 'Propietario',
          apellido: 'Prueba',
          correo: 'propietario.prueba@vetconnect.com',
          password_hash: '$2b$10$xyz...',
          rol: 'COLABORADOR',
          estado: 'ACTIVO',
        },
      });
      console.log(
        'Usuario de prueba creado con ID:',
        usuarioPropietario.id_usuario,
      );
    } else {
      console.log(
        'Usuario de prueba ya existe con ID:',
        usuarioPropietario.id_usuario,
      );
    }

    // 2. Limpiar negocios de prueba previos
    const idPropietario = usuarioPropietario.id_usuario;
    const negociosBorrados = await prisma.negocio.deleteMany({
      where: { id_propietario: idPropietario },
    });
    console.log(
      `Eliminados ${negociosBorrados.count} negocios de prueba anteriores.`,
    );

    // Coordenadas base: 21.150806, -100.959112

    // 3. Insertar Negocio 1 (~0.5 km de distancia)
    await prisma.$executeRaw`
      INSERT INTO negocio (
        id_propietario, nombre, direccion, telefono, descripcion, ubicacion, estado, fecha_creacion
      ) VALUES (
        ${idPropietario},
        'Veterinaria Centro',
        'Calle Principal, Centro',
        '4181112222',
        'Clínica muy cerca al centro.',
        ST_SetSRID(ST_MakePoint(-100.9550, 21.1520), 4326)::geography,
        'ACTIVO',
        NOW()
      );
    `;

    // 4. Insertar Negocio 2 (~2.0 km de distancia)
    await prisma.$executeRaw`
      INSERT INTO negocio (
        id_propietario, nombre, direccion, telefono, descripcion, ubicacion, estado, fecha_creacion
      ) VALUES (
        ${idPropietario},
        'Veterinaria Periferia',
        'Av. Salida, Colonia Sur',
        '4183334444',
        'Clínica a 2 km de distancia.',
        ST_SetSRID(ST_MakePoint(-100.9700, 21.1450), 4326)::geography,
        'ACTIVO',
        NOW()
      );
    `;

    // 5. Insertar Negocio 3 (~4.2 km de distancia - Aún dentro del radio de 5km)
    await prisma.$executeRaw`
      INSERT INTO negocio (
        id_propietario, nombre, direccion, telefono, descripcion, ubicacion, estado, fecha_creacion
      ) VALUES (
        ${idPropietario},
        'Veterinaria Extremo',
        'Carretera a la salida, Norte',
        '4185556666',
        'Clínica en el límite del rango de 5 km.',
        ST_SetSRID(ST_MakePoint(-100.9400, 21.1850), 4326)::geography,
        'ACTIVO',
        NOW()
      );
    `;

    console.log('Sembrado completado exitosamente con negocios cercanos.');
  } catch (error) {
    console.error('Error durante el sembrado de datos:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
