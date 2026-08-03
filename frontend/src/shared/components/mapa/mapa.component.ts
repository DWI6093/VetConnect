import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
  effect,
  signal,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  GeolocalizacionServicio,
  Coordenadas,
} from '../../../app/core/services/geolocalizacion.service';
import { NegociosServicio } from '../../../app/core/services/negocios.servicio';
import { NegocioCercano } from '../../../app/core/models/negocio.modelo';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css',
})
export class MapaComponente implements AfterViewInit, OnDestroy {
  // Inyección de dependencias
  private readonly servicioGeolocalizacion = inject(GeolocalizacionServicio);
  private readonly idPlataforma = inject(PLATFORM_ID);
  private readonly servicioNegocios = inject(NegociosServicio);

  // Referencia al elemento DOM del mapa
  @ViewChild('mapaContenedor')
  private readonly mapaContenedorRef!: ElementRef<HTMLDivElement>;

  // Referencias a los signals del servicio de geolocalización
  protected readonly estado = this.servicioGeolocalizacion.estado;
  protected readonly mensajeError = this.servicioGeolocalizacion.mensajeError;

  // Signals para el estado de los negocios
  protected readonly estadoNegocios = signal<'inicial' | 'cargando' | 'exito' | 'error' | 'vacio'>(
    'inicial',
  );
  protected readonly mensajeErrorNegocios = signal<string | null>(null);

  // Instancias de Leaflet y control de suscripciones
  private mapaInstancia: L.Map | null = null;
  private marcadorUbicacionActual: L.Marker | null = null;
  private marcadoresNegocios: L.Marker[] = [];
  private suscripcionNegocios: Subscription | null = null;

  constructor() {
    // Effect para escuchar de manera reactiva el cambio de coordenadas
    effect(() => {
      const coords = this.servicioGeolocalizacion.coordenadas();
      if (coords && isPlatformBrowser(this.idPlataforma)) {
        this.renderizarMapa(coords);
        this.cargarNegociosCercanos(coords.latitud, coords.longitud);
      }
    });
  }

  public ngAfterViewInit(): void {
    // Al cargarse la vista, se solicita la ubicación en el navegador
    if (isPlatformBrowser(this.idPlataforma)) {
      this.servicioGeolocalizacion.obtenerUbicacionActual();
    }
  }

  /**
   * Inicializa o actualiza el mapa con las coordenadas del usuario
   */
  private renderizarMapa(coordenadas: Coordenadas): void {
    const latitud = coordenadas.latitud;
    const longitud = coordenadas.longitud;

    // Si ya existe una instancia de mapa, simplemente re-centramos y actualizamos marcador
    if (this.mapaInstancia) {
      this.mapaInstancia.setView([latitud, longitud], 15);
      this.actualizarMarcador(latitud, longitud);
      return;
    }

    // Aseguramos que el div contenedor exista en el DOM
    if (!this.mapaContenedorRef || !this.mapaContenedorRef.nativeElement) {
      return;
    }

    // Inicializar mapa de Leaflet
    this.mapaInstancia = L.map(this.mapaContenedorRef.nativeElement, {
      zoomControl: true,
      attributionControl: true,
    }).setView([latitud, longitud], 15);

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores',
    }).addTo(this.mapaInstancia);

    this.actualizarMarcador(latitud, longitud);

    // Forzar redibujado para corregir problemas de tamaño en Leaflet
    setTimeout(() => {
      this.mapaInstancia?.invalidateSize();
    }, 100);
  }

  /**
   * Crea o actualiza la ubicación del marcador actual utilizando un estilo moderno CSS
   */
  private actualizarMarcador(latitud: number, longitud: number): void {
    if (!this.mapaInstancia) return;

    // Creamos un divIcon personalizado para el marcador de ubicación actual (círculo azul brillante estilo GPS)
    const iconoPersonalizado = L.divIcon({
      className: 'marcador-ubicacion-contenedor',
      html: `
        <div class="marcador-pulso"></div>
        <div class="marcador-centro"></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (this.marcadorUbicacionActual) {
      this.marcadorUbicacionActual.setLatLng([latitud, longitud]);
    } else {
      this.marcadorUbicacionActual = L.marker([latitud, longitud], {
        icon: iconoPersonalizado,
      }).addTo(this.mapaInstancia);
    }
  }

  /**
   * Carga los negocios cercanos desde la API y los dibuja en el mapa
   */
  private cargarNegociosCercanos(latitud: number, longitud: number): void {
    if (this.suscripcionNegocios) {
      this.suscripcionNegocios.unsubscribe();
    }

    this.estadoNegocios.set('cargando');
    this.mensajeErrorNegocios.set(null);
    this.limpiarMarcadoresNegocios();

    this.suscripcionNegocios = this.servicioNegocios
      .obtenerNegociosCercanos(latitud, longitud)
      .subscribe({
        next: (negocios) => {
          if (negocios.length === 0) {
            this.estadoNegocios.set('vacio');
          } else {
            this.renderizarMarcadoresNegocios(negocios);
            this.estadoNegocios.set('exito');
          }
        },
        error: (error) => {
          this.estadoNegocios.set('error');
          this.mensajeErrorNegocios.set('Ocurrió un error al obtener los negocios cercanos.');
          console.error('Error al cargar negocios:', error);
        },
      });
  }

  /**
   * Renderiza los marcadores de los negocios en el mapa
   */
  private renderizarMarcadoresNegocios(negocios: NegocioCercano[]): void {
    if (!this.mapaInstancia) return;

    const iconoNegocio = L.divIcon({
      className: 'marcador-negocio-contenedor',
      html: `
        <div class="marcador-negocio-pin">
          <svg class="icono-huella" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="7.5" cy="9.5" r="2.2" />
            <circle cx="12" cy="6.5" r="2.2" />
            <circle cx="16.5" cy="9.5" r="2.2" />
            <path d="M12 11.5c-2 0-3.5 1.5-3.5 3 0 2.5 1.8 4 3.5 4s3.5-1.5 3.5-4c0-1.5-1.5-3-3.5-3z" />
          </svg>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
      popupAnchor: [0, -42],
    });

    negocios.forEach((negocio) => {
      const marcador = L.marker([negocio.latitud, negocio.longitud], {
        icon: iconoNegocio,
      });

      const distanciaAmigable =
        negocio.distanciaMetros < 1000
          ? `A ${Math.round(negocio.distanciaMetros)} m`
          : `A ${(negocio.distanciaMetros / 1000).toFixed(1)} km`;

      const contenidoPopup = `
        <div class="popup-negocio">
          <h4 class="popup-titulo">${negocio.nombre}</h4>
          ${negocio.descripcion ? `<p class="popup-descripcion">${negocio.descripcion}</p>` : ''}
          ${
            negocio.direccion
              ? `
            <p class="popup-info-linea">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${negocio.direccion}
            </p>
          `
              : ''
          }
          ${
            negocio.telefono
              ? `
            <p class="popup-info-linea">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              ${negocio.telefono}
            </p>
          `
              : ''
          }
          <div class="popup-footer">
            <span class="popup-distancia">${distanciaAmigable}</span>
            <button class="popup-boton-detalles" type="button" onclick="event.preventDefault();">Ver detalles</button>
          </div>
        </div>
      `;

      marcador.bindPopup(contenidoPopup, {
        closeButton: false,
        offset: [0, -5],
      });
      marcador.addTo(this.mapaInstancia!);
      this.marcadoresNegocios.push(marcador);
    });
  }

  /**
   * Elimina todos los marcadores de negocios del mapa
   */
  private limpiarMarcadoresNegocios(): void {
    if (!this.mapaInstancia) return;
    this.marcadoresNegocios.forEach((marcador) => {
      marcador.remove();
    });
    this.marcadoresNegocios = [];
  }

  /**
   * Permite al usuario reintentar la solicitud de geolocalización en caso de error.
   */
  protected reintentarUbicacion(): void {
    if (this.estado() === 'denegado') {
      window.location.reload();
    } else {
      this.servicioGeolocalizacion.obtenerUbicacionActual();
    }
  }

  /**
   * Permite al usuario reintentar la obtención de negocios
   */
  protected reintentarNegocios(): void {
    const coords = this.servicioGeolocalizacion.coordenadas();
    if (coords) {
      this.cargarNegociosCercanos(coords.latitud, coords.longitud);
    }
  }

  public ngOnDestroy(): void {
    if (this.suscripcionNegocios) {
      this.suscripcionNegocios.unsubscribe();
    }
    this.limpiarMarcadoresNegocios();

    // Destruimos la instancia del mapa para evitar fugas de memoria
    if (this.mapaInstancia) {
      this.mapaInstancia.remove();
      this.mapaInstancia = null;
    }
    this.marcadorUbicacionActual = null;
  }
}
