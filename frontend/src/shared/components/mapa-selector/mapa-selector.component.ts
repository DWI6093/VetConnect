import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface CoordenadasSeleccionadas {
  latitud: number;
  longitud: number;
}

@Component({
  selector: 'app-mapa-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-selector.component.html',
  styleUrl: './mapa-selector.component.css',
})
export class MapaSelectorComponente implements AfterViewInit, OnChanges, OnDestroy {
  private readonly idPlataforma = inject(PLATFORM_ID);

  @ViewChild('mapaSelectorContenedor') private readonly contenedorRef!: ElementRef<HTMLDivElement>;

  /** Ubicación inicial a mostrar (por ejemplo, el centro de la ciudad, o la ubicación ya guardada al editar) */
  @Input() latitudInicial = 20.9153; // San Miguel de Allende como fallback
  @Input() longitudInicial = -100.7439;

  /** Se emite cada vez que el usuario hace clic en el mapa o arrastra el marcador */
  @Output() ubicacionSeleccionada = new EventEmitter<CoordenadasSeleccionadas>();

  private mapaInstancia: L.Map | null = null;
  private marcador: L.Marker | null = null;

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.idPlataforma)) {
      this.inicializarMapa();
    }
  }

  public ngOnChanges(cambios: SimpleChanges): void {
    // Si el padre actualiza la ubicación inicial después de crear el mapa (ej. al cargar datos para editar)
    if (this.mapaInstancia && (cambios['latitudInicial'] || cambios['longitudInicial'])) {
      const nuevaLat = this.latitudInicial;
      const nuevaLng = this.longitudInicial;
      this.mapaInstancia.setView([nuevaLat, nuevaLng], 16);
      this.colocarMarcador(nuevaLat, nuevaLng);
    }
  }

  private inicializarMapa(): void {
    if (!this.contenedorRef?.nativeElement) return;

    this.mapaInstancia = L.map(this.contenedorRef.nativeElement, {
      zoomControl: true,
      attributionControl: true,
    }).setView([this.latitudInicial, this.longitudInicial], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores',
    }).addTo(this.mapaInstancia);

    this.colocarMarcador(this.latitudInicial, this.longitudInicial);

    // Permite seleccionar ubicación haciendo clic en cualquier punto del mapa
    this.mapaInstancia.on('click', (evento: L.LeafletMouseEvent) => {
      const { lat, lng } = evento.latlng;
      this.colocarMarcador(lat, lng);
      this.ubicacionSeleccionada.emit({ latitud: lat, longitud: lng });
    });

    setTimeout(() => {
      this.mapaInstancia?.invalidateSize();
    }, 100);
  }

  private colocarMarcador(latitud: number, longitud: number): void {
    if (!this.mapaInstancia) return;

    if (this.marcador) {
      this.marcador.setLatLng([latitud, longitud]);
      return;
    }

    this.marcador = L.marker([latitud, longitud], { draggable: true }).addTo(this.mapaInstancia);

    // También permite ajustar arrastrando el marcador
    this.marcador.on('dragend', () => {
      const posicion = this.marcador!.getLatLng();
      this.ubicacionSeleccionada.emit({ latitud: posicion.lat, longitud: posicion.lng });
    });
  }

  public ngOnDestroy(): void {
    if (this.mapaInstancia) {
      this.mapaInstancia.remove();
      this.mapaInstancia = null;
    }
    this.marcador = null;
  }
}