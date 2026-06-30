/**
 * Información mínima de sesión disponible en el frontend.
 * Solo se expone el rol; datos sensibles como correo, nombre
 * o apellido NO se envían al frontend.
 */
export interface SesionUsuario {
  rol: 'CLIENTE' | 'COLABORADOR';
}

/**
 * Respuesta genérica de éxito de los endpoints de autenticación.
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
}

export interface DatosRegistroColaborador {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
}
