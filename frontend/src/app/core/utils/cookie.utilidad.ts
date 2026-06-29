export function guardarCookie(nombre: string, valor: string, dias?: number): void {
  let expira = '';
  if (dias) {
    const fecha = new Date();
    fecha.setTime(fecha.getTime() + dias * 24 * 60 * 60 * 1000);
    expira = `; expires=${fecha.toUTCString()}`;
  }
  document.cookie = `${nombre}=${encodeURIComponent(valor)}${expira}; path=/; SameSite=Strict`;
}

export function obtenerCookie(nombre: string): string | null {
  const correspondencia = document.cookie.match(new RegExp(`(^| )${nombre}=([^;]*)`));
  return correspondencia ? decodeURIComponent(correspondencia[2]) : null;
}

export function eliminarCookie(nombre: string): void {
  document.cookie = `${nombre}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict`;
}
