export class Colaborador {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: 'COLABORADOR';
  estado: 'ACTIVO' | 'BLOQUEADO' | 'PENDIENTE_ELIMINACION' | 'ELIMINADO';
  fecha_registro: Date;
  fecha_actualizacion?: Date;
}
