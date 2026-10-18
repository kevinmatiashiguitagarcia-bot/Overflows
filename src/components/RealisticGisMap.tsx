import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  GIS_QUEBRADAS,
  GisQuebradaData,
  GisEvacuationPoint,
  GisRiskSegment
} from '../data/gisQuebradasData';
import {
  Map as MapIcon,
  Globe,
  ShieldCheck,
  Info,
  Waves,
  X
} from 'lucide-react';

export interface MapActiveLayers {
  inundacion: boolean;
  evacuacion: boolean;
}

export interface MapTargetCoordinate {
  lat: number;
  lng: number;
  label?: string;
  zoom?: number;
}

interface RealisticGisMapProps {
  quebradaId: string;
  isAdmin: boolean;
  userSectorName?: string;
  activeLayers?: MapActiveLayers;
  targetCoordinate?: MapTargetCoordinate | null;
}

export const RealisticGisMap: React.FC<RealisticGisMapProps> = ({
  quebradaId,
  isAdmin,
  userSectorName,
  activeLayers = { inundacion: true, evacuacion: true },
  targetCoordinate
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsTileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'estandar' | 'satelite'>('estandar');
  const [selectedEvacPoint, setSelectedEvacPoint] = useState<GisEvacuationPoint | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<GisRiskSegment | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Fallback to altavista or la-picacha if id not found
  const data: GisQuebradaData = GIS_QUEBRADAS[quebradaId] || GIS_QUEBRADAS['altavista'] || GIS_QUEBRADAS['la-picacha'];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map with geographic constraints for this zone
    const map = L.map(mapContainerRef.current, {
      center: data.center,
      zoom: data.defaultZoom,
      minZoom: isAdmin ? 12 : data.minZoom,
      maxZoom: 18,
      zoomControl: false,
      maxBounds: isAdmin ? undefined : L.latLngBounds(data.bounds),
      maxBoundsViscosity: 0.95
    });

    mapInstanceRef.current = map;

    // Add custom zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial base tile layer (CartoDB Voyager: Google Maps style vector raster)
    const standardTiles = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }
    ).addTo(map);

    baseTileLayerRef.current = standardTiles;

    // Layer group for vector layers
    const layerGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layerGroup;

    // Handle container resizing smoothly
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [quebradaId, data, isAdmin]);

  // Switch Base Layer (Estandar vs Satelite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (labelsTileLayerRef.current) {
      map.removeLayer(labelsTileLayerRef.current);
      labelsTileLayerRef.current = null;
    }

    if (mapStyle === 'estandar') {
      const standardTiles = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }
      ).addTo(map);
      baseTileLayerRef.current = standardTiles;
    } else {
      const satelliteTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, AeroGRID, IGN, and the GIS Community',
          maxZoom: 18
        }
      ).addTo(map);
      baseTileLayerRef.current = satelliteTiles;

      const labelsTiles = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          pane: 'overlayPane',
          opacity: 0.95
        }
      ).addTo(map);
      labelsTileLayerRef.current = labelsTiles;
    }
  }, [mapStyle]);

  // Center dynamically and pulse target pin when targetCoordinate changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !targetCoordinate) return;

    const zoomLevel = targetCoordinate.zoom || 16;
    map.flyTo([targetCoordinate.lat, targetCoordinate.lng], zoomLevel, {
      duration: 1.5,
      easeLinearity: 0.25
    });

    // Remove previous target marker
    if (targetMarkerRef.current) {
      targetMarkerRef.current.remove();
      targetMarkerRef.current = null;
    }

    const pinHtml = `
      <div class="relative flex items-center justify-center animate-bounce">
        <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-blue-400/40">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        ${
          targetCoordinate.label
            ? `<div class="absolute -bottom-6 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black shadow-md border border-slate-700">
                ${targetCoordinate.label}
              </div>`
            : ''
        }
      </div>
    `;

    const pinIcon = L.divIcon({
      className: 'target-pin-icon',
      html: pinHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 24]
    });

    const marker = L.marker([targetCoordinate.lat, targetCoordinate.lng], { icon: pinIcon }).addTo(map);
    targetMarkerRef.current = marker;

    if (targetCoordinate.label) {
      marker.bindTooltip(`<strong>${targetCoordinate.label}</strong>`, { offset: [0, -20] }).openTooltip();
    }
  }, [targetCoordinate]);

  // Render Vector Overlays: Flood Risk Buffer Zone, Riverbed Risk Segments, Evacuation Points
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    // Clear previous vector layers
    group.clearLayers();

    // 1. Render Flood Risk Buffer Zone (Área de Inundación / Franja de Retiro)
    if (activeLayers.inundacion && data.bufferZone && data.bufferZone.length > 0) {
      const bufferPolygon = L.polygon(data.bufferZone, {
        color: '#dc2626',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#ef4444',
        fillOpacity: 0.15
      }).addTo(group);

      bufferPolygon.bindTooltip(
        `<strong>Área de Inundación y Retiro (30m)</strong><br/><span style="font-size:11px;color:#64748b;">Franja de máxima amenaza por desbordamiento</span>`,
        { sticky: true }
      );
    }

    // 2. Render Risk Colored River Segments (Verde, Amarillo, Naranja, Rojo)
    data.riskSegments.forEach((segment) => {
      // Outer shadow line for high contrast
      L.polyline(segment.coordinates, {
        color: '#000000',
        weight: segment.strokeWidth + 3,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(group);

      // Main colored hydrological risk polyline
      const line = L.polyline(segment.coordinates, {
        color: segment.color,
        weight: segment.strokeWidth,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(group);

      line.on('click', () => {
        setSelectedSegment(segment);
        setSelectedEvacPoint(null);
      });

      line.bindTooltip(
        `<div style="font-family:sans-serif;font-size:12px;">
          <strong style="color:${segment.color};">${segment.name}</strong><br/>
          <span>${segment.description}</span>
        </div>`,
        { sticky: true }
      );
    });

    // 3. Render Safe Evacuation Points (Puntos Seguros)
    if (activeLayers.evacuacion && data.evacuationPoints) {
      data.evacuationPoints.forEach((point) => {
        const evacHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-xl bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-200 text-[9px] font-bold border border-emerald-800 shadow-xs pointer-events-none">
              Punto Seguro
            </div>
          </div>
        `;

        const evacIcon = L.divIcon({
          className: 'custom-evac-icon',
          html: evacHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([point.lat, point.lng], { icon: evacIcon }).addTo(group);

        marker.on('click', () => {
          setSelectedEvacPoint(point);
          setSelectedSegment(null);
        });

        marker.bindTooltip(
          `<strong>${point.name}</strong><br/><span style="font-size:11px;">Capacidad: ${point.capacity} personas · ${point.address}</span>`,
          { offset: [0, -14] }
        );
      });
    }
  }, [data, activeLayers]);

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Realistic Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Header Toolbar: Estándar vs Satélite View Toggle */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 dark:border-slate-800 transition-colors">
          <button
            type="button"
            onClick={() => setMapStyle('estandar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mapStyle === 'estandar'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Modo Estándar</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle('satelite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mapStyle === 'satelite'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Modo Satélite</span>
          </button>
        </div>
      </div>

      {/* Floating Hydrological Risk Legend */}
      <div className="absolute bottom-4 left-4 z-20">
        {showLegend ? (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 max-w-xs animate-in fade-in slide-in-from-bottom-2 transition-colors">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Niveles de Riesgo en Cauce</span>
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-pointer"
                title="Minimizar leyenda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Verde: Normal (&lt;50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Amarillo: Vigilancia (50-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Naranja: Alerta (70-85%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                <span className="text-slate-900 dark:text-white font-bold">Rojo: Desborde / Evacuación (&gt;85%)</span>
              </div>
            </div>

            {activeLayers.evacuacion && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                  <span>Puntos Seguros de Evacuación</span>
                </span>
              </div>
            )}

            {activeLayers.inundacion && (
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm border border-red-500 bg-red-500/20 inline-block"></span>
                  <span>Área de Inundación (Retiro 30m)</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ver Convenciones</span>
          </button>
        )}
      </div>

      {/* Detail Card Overlay: Evacuation Point Click */}
      {selectedEvacPoint && (
        <div className="absolute bottom-4 right-14 z-20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 max-w-sm animate-in zoom-in-95 transition-colors">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                {selectedEvacPoint.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedEvacPoint(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">{selectedEvacPoint.address}</p>

          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800 text-xs space-y-1.5 mb-3">
            <div className="flex justify-between">
              <span className="text-emerald-900 dark:text-emerald-300 font-semibold">Capacidad de resguardo:</span>
              <span className="font-bold text-emerald-950 dark:text-emerald-100">{selectedEvacPoint.capacity} personas</span>
            </div>
            <div>
              <span className="text-emerald-900 dark:text-emerald-300 font-semibold block text-[10px]">RUTA SEGURA:</span>
              <span className="text-emerald-800 dark:text-emerald-200 text-[11px]">{selectedEvacPoint.safeRoute}</span>
            </div>
          </div>

          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Contacto de Emergencia:</span>
            <span className="text-rose-600 dark:text-rose-400">{selectedEvacPoint.contact}</span>
          </div>
        </div>
      )}

      {/* Detail Card Overlay: Segment Click */}
      {selectedSegment && (
        <div className="absolute bottom-4 right-14 z-20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm animate-in zoom-in-95 transition-colors">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedSegment.color }}
              />
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                {selectedSegment.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedSegment(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{selectedSegment.description}</p>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Zona de Vigilancia Comuna 70</span>
            <span className="font-bold uppercase" style={{ color: selectedSegment.color }}>
              Riesgo {selectedSegment.riskLevel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
