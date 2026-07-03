CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "accion_auditoria" AS ENUM ('LOGIN', 'LOGOUT', 'CREAR_NEGOCIO', 'ACTUALIZAR_NEGOCIO', 'ELIMINAR_NEGOCIO', 'SOLICITAR_ELIMINACION_CUENTA', 'RESTAURAR_CUENTA', 'ELIMINAR_CUENTA');

-- CreateEnum
CREATE TYPE "dia_semana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "estado_negocio" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "estado_usuario" AS ENUM ('ACTIVO', 'BLOQUEADO', 'PENDIENTE_ELIMINACION', 'ELIMINADO');

-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('CLIENTE', 'COLABORADOR');

-- CreateEnum
CREATE TYPE "usuarios_estado_enum" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'ELIMINADO');

-- CreateEnum
CREATE TYPE "usuarios_rol_enum" AS ENUM ('CLIENTE', 'COLABORADOR');

-- CreateTable
CREATE TABLE "aceptacion_terminos" (
    "id_aceptacion" SERIAL NOT NULL,
    "version_aviso_privacidad" VARCHAR(20) NOT NULL,
    "version_terminos" VARCHAR(20) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_aceptacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_aceptacion" VARCHAR(45) NOT NULL,

    CONSTRAINT "aceptacion_terminos_pkey" PRIMARY KEY ("id_aceptacion")
);

-- CreateTable
CREATE TABLE "bloqueo_ip" (
    "id_bloqueo" SERIAL NOT NULL,
    "ip" INET NOT NULL,
    "intentos" SMALLINT NOT NULL DEFAULT 1,
    "bloqueada_hasta" TIMESTAMPTZ(6) NOT NULL,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_bloqueo_ip" PRIMARY KEY ("id_bloqueo")
);

-- CreateTable
CREATE TABLE "horario" (
    "id_horario" SERIAL NOT NULL,
    "id_negocio" INTEGER NOT NULL,
    "dia" "dia_semana" NOT NULL,
    "hora_apertura" TIME(6) NOT NULL,
    "hora_cierre" TIME(6) NOT NULL,

    CONSTRAINT "pk_horario" PRIMARY KEY ("id_horario")
);

-- CreateTable
CREATE TABLE "imagen_negocio" (
    "id_imagen" SERIAL NOT NULL,
    "id_negocio" INTEGER NOT NULL,
    "ruta_imagen" VARCHAR(500) NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "orden" SMALLINT NOT NULL DEFAULT 1,
    "fecha_subida" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_imagen_negocio" PRIMARY KEY ("id_imagen")
);

-- CreateTable
CREATE TABLE "log_auditoria" (
    "id_log" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "accion" "accion_auditoria" NOT NULL,
    "entidad_afectada" VARCHAR(50),
    "id_entidad" INTEGER,
    "ip" INET,
    "user_agent" VARCHAR(500),
    "fecha_hora" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_log_auditoria" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "log_errores" (
    "id_error" SERIAL NOT NULL,
    "modulo" VARCHAR(100) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "stacktrace" TEXT,
    "id_usuario" INTEGER,
    "ip" VARCHAR(45),
    "fecha_error" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_errores_pkey" PRIMARY KEY ("id_error")
);

-- CreateTable
CREATE TABLE "negocio" (
    "id_negocio" SERIAL NOT NULL,
    "id_propietario" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "direccion" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(10) NOT NULL,
    "descripcion" TEXT,
    "ubicacion" geography NOT NULL,
    "estado" "estado_negocio" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),

    CONSTRAINT "pk_negocio" PRIMARY KEY ("id_negocio")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" SERIAL NOT NULL,
    "id_negocio" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(250),
    "precio" DECIMAL(10,2) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pk_producto" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "servicio" (
    "id_servicio" SERIAL NOT NULL,
    "id_negocio" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(250),
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pk_servicio" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "apellido" VARCHAR(50) NOT NULL,
    "correo" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "refresh_token_hash" VARCHAR(255),
    "rol" "rol_usuario" NOT NULL,
    "estado" "estado_usuario" NOT NULL DEFAULT 'ACTIVO',
    "intentos_fallidos" SMALLINT NOT NULL DEFAULT 0,
    "fecha_registro" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMPTZ(6),
    "fecha_solicitud_eliminacion" TIMESTAMPTZ(6),
    "fecha_eliminacion_programada" TIMESTAMPTZ(6),

    CONSTRAINT "pk_usuario" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE INDEX "idx_aceptacion_usuario" ON "aceptacion_terminos"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "uq_bloqueo_ip" ON "bloqueo_ip"("ip");

-- CreateIndex
CREATE INDEX "idx_bloqueo_fecha" ON "bloqueo_ip"("bloqueada_hasta");

-- CreateIndex
CREATE INDEX "idx_horario_negocio" ON "horario"("id_negocio");

-- CreateIndex
CREATE UNIQUE INDEX "uq_horario" ON "horario"("id_negocio", "dia");

-- CreateIndex
CREATE INDEX "idx_imagen_negocio" ON "imagen_negocio"("id_negocio");

-- CreateIndex
CREATE INDEX "idx_log_accion" ON "log_auditoria"("accion");

-- CreateIndex
CREATE INDEX "idx_log_fecha" ON "log_auditoria"("fecha_hora");

-- CreateIndex
CREATE INDEX "idx_log_usuario" ON "log_auditoria"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_log_errores_usuario" ON "log_errores"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_negocio_estado" ON "negocio"("estado");

-- CreateIndex
CREATE INDEX "idx_negocio_nombre" ON "negocio"("nombre");

-- CreateIndex
CREATE INDEX "idx_negocio_propietario" ON "negocio"("id_propietario");

-- CreateIndex
CREATE INDEX "idx_negocio_ubicacion" ON "negocio" USING GIST ("ubicacion");

-- CreateIndex
CREATE INDEX "idx_producto_negocio" ON "producto"("id_negocio");

-- CreateIndex
CREATE INDEX "idx_servicio_negocio" ON "servicio"("id_negocio");

-- CreateIndex
CREATE UNIQUE INDEX "uq_usuario_correo" ON "usuario"("correo");

-- CreateIndex
CREATE INDEX "idx_usuario_estado" ON "usuario"("estado");

-- CreateIndex
CREATE INDEX "idx_usuario_rol" ON "usuario"("rol");

-- AddForeignKey
ALTER TABLE "aceptacion_terminos" ADD CONSTRAINT "fk_aceptacion_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "horario" ADD CONSTRAINT "fk_horario_negocio" FOREIGN KEY ("id_negocio") REFERENCES "negocio"("id_negocio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen_negocio" ADD CONSTRAINT "fk_imagen_negocio" FOREIGN KEY ("id_negocio") REFERENCES "negocio"("id_negocio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_auditoria" ADD CONSTRAINT "fk_log_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_errores" ADD CONSTRAINT "fk_log_errores_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "negocio" ADD CONSTRAINT "fk_negocio_usuario" FOREIGN KEY ("id_propietario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "fk_producto_negocio" FOREIGN KEY ("id_negocio") REFERENCES "negocio"("id_negocio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicio" ADD CONSTRAINT "fk_servicio_negocio" FOREIGN KEY ("id_negocio") REFERENCES "negocio"("id_negocio") ON DELETE CASCADE ON UPDATE CASCADE;
