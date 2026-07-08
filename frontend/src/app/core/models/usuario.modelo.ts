/**
 * Información de sesión disponible en el frontend, incluyendo datos de perfil.
 */
export interface SesionUsuario {
  rol: 'CLIENTE' | 'COLABORADOR';
  estado: 'ACTIVO' | 'PENDIENTE_ELIMINACION';
  nombre: string;
  apellido: string;
  correo: string;
  password?: string;
}

/**
 * Respuesta de éxito de los endpoints de autenticación.
 */
export interface RespuestaAuth {
  mensaje: string;
}

export interface DatosInicioSesion {
  correo: string;
  contrasena: string;
}

export interface DatosRegistroCliente {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  aceptoAviso: boolean;
}

export interface DatosRegistroColaborador {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  aceptoAviso: boolean;
}

export interface PerfilUsuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: 'CLIENTE' | 'COLABORADOR';
  estado: 'ACTIVO' | 'BLOQUEADO' | 'PENDIENTE_ELIMINACION' | 'ELIMINADO';
  fecha_registro: string;
  fecha_actualizacion: string | null;
  fecha_solicitud_eliminacion: string | null;
  fecha_eliminacion_programada: string | null;
}

export interface RespuestaCancelacion {
  mensaje: string;
  fecha_eliminacion_programada: string;
}