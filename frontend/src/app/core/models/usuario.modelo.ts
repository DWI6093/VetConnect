export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: 'CLIENTE' | 'COLABORADOR';
  estado: string;
}

export interface RespuestaAutenticacion {
  usuario: Usuario;
  token: string;
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
