import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        width: 100%;
        height: 100%;
      }

      .list-group {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99;
      }

      li {
        cursor: pointer;
      }
    `,
  ],
})
export class MarcadoresComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 17;
  center: [number, number] = [-58.0716417, -32.3223882];

  marcadores: MarcadorColor[] = [];

  constructor() {}

  ngOnDestroy(): void {
    this.mapa.off('zoom', () => {});
    this.mapa.off('move', () => {});
  }

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement, // container HTMLElement
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: this.center, // starting position [lng, lat]
      zoom: this.zoomLevel, // starting zoom
      maxZoom: 18,
    });

    this.mapa.on('zoom', () => {
      this.zoomLevel = this.mapa.getZoom();
    });

    this.mapa.on('move', (ev) => {
      const { lng, lat } = ev.target.getCenter();
      this.center = [lng, lat];
    });

    this.leerLocalStorage();

    // const markerHtml = document.createElement('div');
    // markerHtml.innerHTML = 'Hola Mundo'

    // new mapboxgl.Marker({
    //   element: markerHtml,
    // })
    //   .setLngLat(this.center)
    //   .addTo(this.mapa);
  }

  irMarcador(marker: mapboxgl.Marker) {
    this.mapa.flyTo({
      center: marker.getLngLat(),
    });
  }

  agregarMarcador(marcador?: MarcadorColor) {
    const color = '#xxxxxx'.replace(/x/g, () =>
      ((Math.random() * 16) | 0).toString(16)
    );

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color: marcador?.color || color,
    })
      .setLngLat(marcador?.centro || this.center)
      .addTo(this.mapa);

    this.marcadores.push({ color, marker: nuevoMarcador });
    this.guardarMarcadoresLocalStorage();

    nuevoMarcador.on('dragend', () => {
      this.guardarMarcadoresLocalStorage();
    });
  }

  borrarMarcador(i: number){
    this.marcadores[i].marker!.remove();
    this.marcadores.splice(i, 1);

    this.guardarMarcadoresLocalStorage();
  }

  guardarMarcadoresLocalStorage() {
    const lngLatArr: MarcadorColor[] = [];

    this.marcadores.forEach((m) => {
      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();

      lngLatArr.push({ color, centro: [lng, lat] });
    });

    localStorage.setItem('marcadores', JSON.stringify(lngLatArr));
  }

  leerLocalStorage() {
    if (!localStorage.getItem('marcadores')) return;

    const lngLatArr: MarcadorColor[] = JSON.parse(
      localStorage.getItem('marcadores')!
    );

    lngLatArr.forEach((marcador) => {
      this.agregarMarcador(marcador);
    });
  }
}
