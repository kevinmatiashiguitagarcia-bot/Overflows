import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  GIS_QUEBRADAS,
  GisQuebradaData,
  GisSensorPoint,
  GisEvacuationPoint,
  GisLandmarkPoint,
  GisRiskSegment
} from '../data/gisQuebradasData';
import {
  Layers,
  Map as MapIcon,
  Globe,
  Radio,
  ShieldCheck,
  MapPin,
  Maximize2,
  Compass,
  AlertTriangle,
  Info,
  Waves,
  Navigation,
  X
} from 'lucide-react';

export interface MapActiveLayers {
  inundacion: boolean;
  evacuacion: boolean;
  sensores: boolean;
}

interface RealisticGisMapProps {
  quebradaId: string;
  isAdmin: boolean;
  userSectorName?: string;
  activeLayers?: MapActiveLayers;
}

export const RealisticGisMap: React.FC<RealisticGisMapProps> = ({
  quebradaId,
  isAdmin,
  userSectorName,
  activeLayers = { inundacion: true, evacuacion: true, sensores: true }
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsTileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'estandar' | 'satelite'>('estandar');
  const [selectedSensor, setSelectedSensor] = useState<GisSensorPoint | null>(null);
  const [selectedEvacPoint, setSelectedEvacPoint] = useState<GisEvacuationPoint | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<GisRiskSegment | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Fallback to la-picacha if id not found
  const data: GisQuebradaData = GIS_QUEBRADAS[quebradaId] || GIS_QUEBRADAS['la-picacha'];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map with strict geographic constraints for this zone
    const map = L.map(mapContainerRef.current, {
      center: data.center,
      zoom: data.defaultZoom,
      minZoom: isAdmin ? 12 : data.minZoom,
      maxZoom: 18,
      zoomControl: false, // We'll add custom positioned zoom control
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

    // Create layer group for vector elements (polylines, polygons, markers)
    const layerGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layerGroup;

    // Handle container resizing
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
  }, [quebradaId, data]);

  // Switch Base Layer (Estandar vs Satelite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (labelsTileLayerRef.current) {
      map.removeLayer(labelsTileLayerRef.current);
      labelsTileLayerRef.current = null;
    }

    if (mapStyle === 'estandar') {
      // Crisp Google Maps / Urban Road Map style with street names & building blocks
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
      // Photorealistic Aerial Satellite Imagery from Esri World Imagery
      const satelliteTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 18
        }
      ).addTo(map);
      baseTileLayerRef.current = satelliteTiles;

      // Overlay transparent street labels so roads remain crystal clear
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

  // Render Overlays: Risk Colored Polylines, Hazard Buffer, Sensor Markers, Evacuation Points
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    // Clear previous vector layers
    group.clearLayers();

    // 1. Render Flood Risk Buffer Zone (Zona de Retiro y Amenaza de Inundación)
    if (activeLayers.inundacion && data.bufferZone && data.bufferZone.length > 0) {
      const bufferPolygon = L.polygon(data.bufferZone, {
        color: '#dc2626',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#ef4444',
        fillOpacity: 0.12
      }).addTo(group);

      bufferPolygon.bindTooltip(
        `<strong>Zona de Retiro Hídrico (30m)</strong><br/><span style="font-size:11px;color:#64748b;">Franja de máxima amenaza por desbordamiento</span>`,
        { sticky: true }
      );
    }

    // 2. Render Risk Colored River Segments (Verde, Amarillo, Naranja, Rojo)
    data.riskSegments.forEach((segment) => {
      // Outer shadow line for high contrast over satellite imagery
      L.polyline(segment.coordinates, {
        color: '#000000',
        weight: segment.strokeWidth + 3,
        opacity: 0.5,
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
        setSelectedSensor(null);
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

    // 3. Render SIATA Sensor Stations
    if (activeLayers.sensores) {
      data.sensors.forEach((sensor) => {
        const isCritical = sensor.status === 'alerta_naranja' || sensor.status === 'alerta_roja';
        const isModerate = sensor.status === 'alerta_amarilla';
        const markerColor = isCritical ? '#ef4444' : isModerate ? '#eab308' : '#10b981';

        const sensorHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute -inset-2 rounded-full opacity-75 animate-ping" style="background-color: ${markerColor};"></div>
            <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[11px] font-black" style="background-color: ${markerColor};">
              ${sensor.capacityPercentage}%
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[9px] font-bold border border-slate-700 shadow-xs pointer-events-none">
              ${sensor.code}
            </div>
          </div>
        `;

        const sensorIcon = L.divIcon({
          className: 'custom-sensor-icon',
          html: sensorHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([sensor.lat, sensor.lng], { icon: sensorIcon }).addTo(group);

        marker.on('click', () => {
          setSelectedSensor(sensor);
          setSelectedEvacPoint(null);
          setSelectedSegment(null);
        });

        marker.bindTooltip(
          `<strong>${sensor.name} (${sensor.code})</strong><br/>
           <span style="font-size:11px;">Nivel: ${sensor.levelMeters.toFixed(2)} m · Capacidad: ${sensor.capacityPercentage}%</span>`,
          { offset: [0, -16] }
        );
      });
    }

    // 4. Render Evacuation Meeting Points
    if (activeLayers.evacuacion) {
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
          setSelectedSensor(null);
          setSelectedSegment(null);
        });

        marker.bindTooltip(`<strong>${point.name}</strong><br/>Capacidad: ${point.capacity} personas`, {
          offset: [0, -14]
        });
      });
    }

    // 5. Render Real Geographic Landmarks (Puentes, Escuelas)
    data.landmarks.forEach((landmark) => {
      const landmarkHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="w-6 h-6 rounded-lg bg-blue-600 border border-white shadow-xs flex items-center justify-center text-white text-[10px]">
            ${landmark.type === 'puente' ? '🌉' : landmark.type === 'escuela' ? '🏫' : '📍'}
          </div>
        </div>
      `;

      const landmarkIcon = L.divIcon({
        className: 'custom-landmark-icon',
        html: landmarkHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon }).addTo(group);

      marker.bindPopup(
        `<div style="font-family:sans-serif;padding:2px;">
           <strong style="color:#0f172a;font-size:12px;">${landmark.name}</strong>
           <p style="margin:4px 0 0 0;font-size:11px;color:#475569;">${landmark.description}</p>
         </div>`
      );
    });

    // Fit map bounds cleanly
    map.fitBounds(data.bounds, { padding: [40, 40] });
  }, [data, activeLayers]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(data.bounds, { padding: [30, 30] });
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[650px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
      {/* Realist Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Header Toolbar: Estándar vs Satélite toggle */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center p-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setMapStyle('estandar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mapStyle === 'estandar'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Modo Estándar (Calles)</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle('satelite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              mapStyle === 'satelite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Modo Satélite (Aéreo)</span>
          </button>
        </div>

        {/* Recenter Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="p-2.5 bg-white/95 hover:bg-white text-slate-800 rounded-2xl shadow-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          title="Centrar en mi zona asignada"
        >
          <Navigation className="w-4 h-4 text-rose-600" />
          <span className="hidden sm:inline">Centrar en mi Quebrada</span>
        </button>
      </div>

      {/* Zone Identifier Badge */}
      <div className="absolute top-4 right-4 z-20 bg-slate-950/85 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-slate-800 shadow-lg text-right">
        <div className="flex items-center gap-2 justify-end">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
            {data.name}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 font-medium">
          {data.officialSector}
        </p>
      </div>

      {/* Floating Hydrological Risk Legend */}
      <div className="absolute bottom-4 left-4 z-20">
        {showLegend ? (
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/90 max-w-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-blue-600" />
                <span>Niveles de Riesgo en el Cauce</span>
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Minimizar leyenda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-700 font-medium">Verde: Normal / Cota Segura (&lt;50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-slate-700 font-medium">Amarillo: Vigilancia Activa (50-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                <span className="text-slate-700 font-medium">Naranja: Alerta en Puente (70-85%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                <span className="text-slate-900 font-bold">Rojo: Desbordamiento / Evacuar (&gt;85%)</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                Sensores Radar SIATA
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                Puntos Seguros
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 text-xs font-bold text-slate-800 hover:bg-white flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Ver Convenciones de Riesgo</span>
          </button>
        )}
      </div>

      {/* Detail Card Overlay: Sensor Click */}
      {selectedSensor && (
        <div className="absolute bottom-4 right-14 z-20 bg-white/98 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 max-w-sm animate-in zoom-in-95">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full animate-ping"
                style={{
                  backgroundColor:
                    selectedSensor.status === 'alerta_roja'
                      ? '#ef4444'
                      : selectedSensor.status === 'alerta_naranja'
                      ? '#f97316'
                      : selectedSensor.status === 'alerta_amarilla'
                      ? '#eab308'
                      : '#10b981'
                }}
              />
              <h4 className="text-xs font-extrabold text-slate-900">
                {selectedSensor.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedSensor(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mb-3">{selectedSensor.sectorName}</p>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">NIVEL ACTUAL</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {selectedSensor.levelMeters.toFixed(2)} m
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">CAPACIDAD</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {selectedSensor.capacityPercentage}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">TENDENCIA</span>
              <span className="font-medium text-slate-700">{selectedSensor.trend}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">ALTITUD</span>
              <span className="font-medium text-slate-700">{selectedSensor.elevation} msnm</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 flex items-center justify-between">
            <span className="font-mono text-slate-400">{selectedSensor.code}</span>
            <span className="font-semibold text-emerald-700">Telemetría SIATA Oficial</span>
          </div>
        </div>
      )}

      {/* Detail Card Overlay: Evacuation Point Click */}
      {selectedEvacPoint && (
        <div className="absolute bottom-4 right-14 z-20 bg-white/98 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-emerald-200 max-w-sm animate-in zoom-in-95">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="text-xs font-extrabold text-slate-900">
                {selectedEvacPoint.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedEvacPoint(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 mb-2">{selectedEvacPoint.address}</p>

          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-xs space-y-1.5 mb-3">
            <div className="flex justify-between">
              <span className="text-emerald-900 font-semibold">Capacidad de resguardo:</span>
              <span className="font-bold text-emerald-950">{selectedEvacPoint.capacity} personas</span>
            </div>
            <div>
              <span className="text-emerald-900 font-semibold block text-[10px]">RUTA SEGURA:</span>
              <span className="text-emerald-800 text-[11px]">{selectedEvacPoint.safeRoute}</span>
            </div>
          </div>

          <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
            <span>Contacto de Emergencia:</span>
            <span className="text-rose-700">{selectedEvacPoint.contact}</span>
          </div>
        </div>
      )}

      {/* Detail Card Overlay: Segment Click */}
      {selectedSegment && (
        <div className="absolute bottom-4 right-14 z-20 bg-white/98 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 max-w-sm animate-in zoom-in-95">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedSegment.color }}
              />
              <h4 className="text-xs font-extrabold text-slate-900">
                {selectedSegment.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedSegment(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-3">{selectedSegment.description}</p>

          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
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
