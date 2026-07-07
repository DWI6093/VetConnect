/**
 * Información de sesión disponible en el frontend, incluyendo datos de perfil.
 */
export interface SesionUsuario {
  rol: 'CLIENTE' | 'COLABORADOR';
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
