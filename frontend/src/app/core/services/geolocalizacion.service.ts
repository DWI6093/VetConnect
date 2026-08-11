import { Injectable, signal, computed } from '@angular/core';

export type EstadoGeolocalizacion = 'inicial' | 'cargando' | 'exito' | 'error' | 'denegado';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeolocalizacionServicio {
  // Signals privadas para control del estado interno
  private readonly estadoInterno = signal<EstadoGeolocalizacion>('inicial');
  private readonly coordenadasInternas = signal<Coordenadas | null>(null);
  private readonly mensajeErrorInterno = signal<string | null>(null);

  // Exposición pública de los signals en modo lectura para garantizar inmutabilidad externa
  public readonly estado = computed(() => this.estadoInterno());
  public readonly coordenadas = computed(() => this.coordenadasInternas());
  public readonly mensajeError = computed(() => this.mensajeErrorInterno());

  /**
   * Solicita la ubicación actual del usuario mediante la API de Geolocalización del navegador.
   */
  public obtenerUbicacionActual(): void {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.estadoInterno.set('error');
      this.mensajeErrorInterno.set('La geolocalización no es compatible con este navegador.');
      return;
    }

    this.estadoInterno.set('cargando');
    this.mensajeErrorInterno.set(null);

    const opciones: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (posicion: GeolocationPosition) => {
        this.coordenadasInternas.set({
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
        });
        this.estadoInterno.set('exito');
      },
      (error: GeolocationPositionError) => {
        this.coordenadasInternas.set(null);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.estadoInterno.set('denegado');
            this.mensajeErrorInterno.set(
              'Has denegado el permiso para acceder a tu ubicación. Por favor, actívalo en la configuración de tu navegador para ver el mapa.',
            );
            break;
          case error.POSITION_UNAVAILABLE:
            this.estadoInterno.set('error');
            this.mensajeErrorInterno.set(
              'La información de ubicación no está disponible en este momento.',
            );
            break;
          case error.TIMEOUT:
            this.estadoInterno.set('error');
            this.mensajeErrorInterno.set('Se agotó el tiempo de espera para obtener la ubicación.');
            break;
          default:
            this.estadoInterno.set('error');
            this.mensajeErrorInterno.set('Ocurrió un error inesperado al obtener la ubicación.');
            break;
        }
      },
      opciones,
    );
  }

  /**
   * Restablece el servicio a su estado inicial.
   */
  public restablecerEstado(): void {
    this.estadoInterno.set('inicial');
    this.coordenadasInternas.set(null);
    this.mensajeErrorInterno.set(null);
  }
}
