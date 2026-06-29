export class Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: 'CLIENTE' | 'COLABORADOR';
  estado: 'ACTIVO' | 'BLOQUEADO' | 'PENDIENTE_ELIMINACION' | 'ELIMINADO';
  fecha_registro: Date;
}
