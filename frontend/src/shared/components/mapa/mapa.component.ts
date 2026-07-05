import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
  effect
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { GeolocalizacionServicio, Coordenadas } from '../../../app/core/services/geolocalizacion.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponente implements AfterViewInit, OnDestroy {
  // Inyección de dependencias
  private readonly servicioGeolocalizacion = inject(GeolocalizacionServicio);
  private readonly idPlataforma = inject(PLATFORM_ID);

  // Referencia al elemento DOM del mapa
  @ViewChild('mapaContenedor') private readonly mapaContenedorRef!: ElementRef<HTMLDivElement>;

  // Referencias a los signals del servicio
  protected readonly estado = this.servicioGeolocalizacion.estado;
  protected readonly mensajeError = this.servicioGeolocalizacion.mensajeError;

  // Instancias de Leaflet
  private mapaInstancia: L.Map | null = null;
  private marcadorUbicacionActual: L.Marker | null = null;

  constructor() {
    // Effect para escuchar de manera reactiva el cambio de coordenadas
    effect(() => {
      const coords = this.servicioGeolocalizacion.coordenadas();
      if (coords && isPlatformBrowser(this.idPlataforma)) {
        this.renderizarMapa(coords);
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
      attributionControl: true
    }).setView([latitud, longitud], 15);

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores'
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
      iconAnchor: [12, 12]
    });

    if (this.marcadorUbicacionActual) {
      this.marcadorUbicacionActual.setLatLng([latitud, longitud]);
    } else {
      this.marcadorUbicacionActual = L.marker([latitud, longitud], {
        icon: iconoPersonalizado
      }).addTo(this.mapaInstancia);
    }
  }

  /**
   * Permite al usuario reintentar la solicitud de geolocalización en caso de error.
   * Si el acceso está denegado, se recarga la página para que el navegador reevalúe
   * los permisos una vez que el usuario los haya cambiado en la barra de direcciones.
   */
  protected reintentarUbicacion(): void {
    if (this.estado() === 'denegado') {
      window.location.reload();
    } else {
      this.servicioGeolocalizacion.obtenerUbicacionActual();
    }
  }

  public ngOnDestroy(): void {
    // Destruimos la instancia del mapa para evitar fugas de memoria
    if (this.mapaInstancia) {
      this.mapaInstancia.remove();
      this.mapaInstancia = null;
    }
    this.marcadorUbicacionActual = null;
  }
}
