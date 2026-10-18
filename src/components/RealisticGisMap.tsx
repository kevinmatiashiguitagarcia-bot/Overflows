import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  GIS_QUEBRADAS,
  GisQuebradaData,
  GisEvacuationPoint,
  GisRiskSegment
} from '../data/gisQuebradasData';
import { calculateLiveSiataReading } from '../data/siataTelemetryService';
import {
  Globe,
  ShieldCheck,
  Waves,
  X,
  Compass,
  AlertTriangle,
  Info
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
  cuencaStatus?: 'seguro' | 'alerta_amarilla' | 'alerta_naranja' | 'alerta_roja';
  capacityPercentage?: number;
}

export const RealisticGisMap: React.FC<RealisticGisMapProps> = ({
  quebradaId,
  isAdmin,
  userSectorName,
  activeLayers = { inundacion: true, evacuacion: true },
  targetCoordinate,
  cuencaStatus,
  capacityPercentage
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);

  const [selectedEvacPoint, setSelectedEvacPoint] = useState<GisEvacuationPoint | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<GisRiskSegment | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Fallback to altavista or la-picacha if id not found
  const data: GisQuebradaData =
    GIS_QUEBRADAS[quebradaId] ||
    GIS_QUEBRADAS['altavista'] ||
    GIS_QUEBRADAS['la-picacha'];

  // Obtener lectura en tiempo real de SIATA si no se pasa explícitamente en props
  const liveReading = useMemo(() => {
    return calculateLiveSiataReading(quebradaId);
  }, [quebradaId]);

  const effectiveStatus = cuencaStatus || liveReading.status;
  const effectiveCapacity = typeof capacityPercentage === 'number' ? capacityPercentage : liveReading.capacityPercentage;

  // CORRECCIÓN TÉCNICA DEL CÓDIGO DE COLORES DE RIESGO:
  // Verde: Condiciones óptimas y seguras (Elimina el error de aparecer en amarillo en normalidad)
  // Amarillo: Alerta Preventiva (50% - 75%)
  // Rojo / Naranja: Creciente o Desbordamiento (> 75%)
  const riskPalette = useMemo(() => {
    if (effectiveStatus === 'alerta_naranja' || effectiveStatus === 'alerta_roja' || effectiveCapacity >= 75) {
      return {
        fillColor: '#ef4444',
        borderColor: '#dc2626',
        fillOpacity: 0.28,
        strokeWidth: 6,
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        label: 'ALERTA DE CRECIENTE',
        description: 'Nivel crítico. Monitoreo constante de muros y laderas.'
      };
    }
    if (effectiveStatus === 'alerta_amarilla' || effectiveCapacity >= 50) {
      return {
        fillColor: '#f59e0b',
        borderColor: '#d97706',
        fillOpacity: 0.22,
        strokeWidth: 6,
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        label: 'ALERTA PREVENTIVA',
        description: 'Nivel en vigilancia preventiva por lluvias en la cuenca alta.'
      };
    }
    // Estado SEGURO y NORMAL (VERDE OBLIGATORIO)
    return {
      fillColor: '#10b981',
      borderColor: '#059669',
      fillOpacity: 0.18,
      strokeWidth: 5,
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      label: 'CONDICIONES NORMALES · CAUDAL SEGURO',
      description: 'Caudal laminar dentro del cauce. Sin riesgo de desbordamiento.'
    };
  }, [effectiveStatus, effectiveCapacity]);

  // 1. Initialize Leaflet Map with EXCLUSIVE Satellite Imagery Base Layer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: data.center,
      zoom: data.defaultZoom,
      minZoom: isAdmin ? 12 : data.minZoom,
      maxZoom: 19,
      zoomControl: false,
      maxBounds: isAdmin ? undefined : L.latLngBounds(data.bounds),
      maxBoundsViscosity: 0.95
    });

    mapInstanceRef.current = map;

    // Zoom controls at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // REQUERIMIENTO TÉCNICO: Capa base satelital exclusiva (Esri World Imagery)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics &mdash; SIATA Comuna 70',
        maxZoom: 19
      }
    ).addTo(map);

    // Superposición de nombres de veredas, calles y puntos de referencia sobre el satélite
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
        pane: 'overlayPane',
        opacity: 0.95
      }
    ).addTo(map);

    // Layer group para vectores dinámicos
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

  // 2. Center dynamically and pulse target pin when targetCoordinate changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !targetCoordinate) return;

    const zoomLevel = targetCoordinate.zoom || 16;
    map.flyTo([targetCoordinate.lat, targetCoordinate.lng], zoomLevel, {
      duration: 1.2,
      easeLinearity: 0.25
    });

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

  // 3. Render Vector Overlays with DYNAMIC RISK COLORING (Verde para normalidad)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Capa 1: Franja de Retiro Hidrológico / Área de Inundación (30m)
    // Se pinta en VERDE si está seguro, Amarillo si alerta preventiva, Rojo si creciente
    if (activeLayers.inundacion && data.bufferZone && data.bufferZone.length > 0) {
      const bufferPolygon = L.polygon(data.bufferZone, {
        color: riskPalette.borderColor,
        weight: 2,
        dashArray: effectiveStatus === 'seguro' ? '4, 4' : undefined,
        fillColor: riskPalette.fillColor,
        fillOpacity: riskPalette.fillOpacity
      }).addTo(group);

      const statusTitle =
        effectiveStatus === 'seguro'
          ? 'Franja de Retiro Hidrológico (30m) · COTA NORMAL'
          : effectiveStatus === 'alerta_amarilla'
          ? 'Área de Alerta Preventiva (30m)'
          : 'Zona de Máxima Amenaza por Desbordamiento';

      bufferPolygon.bindTooltip(
        `<div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <strong style="color:${riskPalette.borderColor};">${statusTitle}</strong><br/>
          <span style="color:#64748b;">${riskPalette.description}</span><br/>
          <span style="font-weight:bold;color:${riskPalette.borderColor}; font-size:11px;">Capacidad del cauce: ${effectiveCapacity}%</span>
        </div>`,
        { sticky: true }
      );
    }

    // Capa 2: Trazado Georreferenciado Real de Quebradas SIATA
    // Si la cuenca está normal, todos los tramos se presentan en VERDE (#10b981)
    data.riskSegments.forEach((segment) => {
      // Línea de sombra exterior para alto contraste sobre imagen satelital
      L.polyline(segment.coordinates, {
        color: '#000000',
        weight: segment.strokeWidth + 3,
        opacity: 0.65,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(group);

      // Color dinámico según estado real
      const segmentColor = effectiveStatus === 'seguro' ? '#10b981' : riskPalette.borderColor;

      const line = L.polyline(segment.coordinates, {
        color: segmentColor,
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
          <strong style="color:${segmentColor};">${segment.name}</strong><br/>
          <span style="color:#475569;">${segment.description}</span><br/>
          <span style="font-size:11px; font-weight:bold; color:${segmentColor};">
            Estado SIATA: ${effectiveStatus === 'seguro' ? 'Caudal Seguro (<50%)' : 'Alerta Hidrológica'}
          </span>
        </div>`,
        { sticky: true }
      );
    });

    // Capa 3: Puntos Seguros de Evacuación (Georreferenciados en Cota Alta)
    if (activeLayers.evacuacion && data.evacuationPoints) {
      data.evacuationPoints.forEach((point) => {
        const evacHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-8 h-8 rounded-2xl bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white ring-2 ring-emerald-400/50">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-200 text-[10px] font-black border border-emerald-700 shadow-md pointer-events-none">
              Punto Seguro
            </div>
          </div>
        `;

        const evacIcon = L.divIcon({
          className: 'custom-evac-icon',
          html: evacHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([point.lat, point.lng], { icon: evacIcon }).addTo(group);

        marker.on('click', () => {
          setSelectedEvacPoint(point);
          setSelectedSegment(null);
        });

        marker.bindTooltip(
          `<strong>${point.name}</strong><br/><span style="font-size:11px;">Capacidad: ${point.capacity} personas · ${point.address}</span>`,
          { offset: [0, -16] }
        );
      });
    }
  }, [data, activeLayers, effectiveStatus, effectiveCapacity, riskPalette]);

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Canvas del Mapa Satelital */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating HUD: Indicador Satelital Permanente SIATA Comuna 70 */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md text-white rounded-2xl shadow-xl border border-slate-700/80">
          <Globe className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black tracking-wide uppercase text-slate-100">
                Vista Satelital SIATA
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 font-semibold">
              Comuna 70 · Alta Resolución
            </span>
          </div>
        </div>

        {/* Badge de Estado Hidrológico en Tiempo Real del Cauce */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-md border text-xs font-black shadow-lg ${riskPalette.badgeBg}`}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: riskPalette.borderColor }} />
          <span>{riskPalette.label}</span>
        </div>
      </div>

      {/* Convenciones Hidrológicas en Vivo (Leyenda de Riesgo Oficial SIATA) */}
      <div className="absolute bottom-4 left-4 z-20">
        {showLegend ? (
          <div className="bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-white">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>Niveles de Riesgo SIATA</span>
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Minimizar leyenda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                <span className="font-semibold text-slate-200">
                  Verde: <strong className="text-emerald-400">Normalidad / Seguro</strong> (&lt;50% capacidad)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 shadow-xs" />
                <span className="font-semibold text-slate-200">
                  Amarillo: <strong className="text-amber-400">Alerta Preventiva</strong> (50% - 75%)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-xs" />
                <span className="font-semibold text-slate-200">
                  Rojo: <strong className="text-rose-400">Creciente / Riesgo</strong> (&gt;75%)
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span>Franja de retiro: 30 metros</span>
              <span className="text-emerald-400 font-bold">Telemetría Activa</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="p-2.5 bg-slate-900/90 text-white rounded-xl shadow-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ver Convenciones</span>
          </button>
        )}
      </div>

      {/* Tarjeta Flotante al Seleccionar un Punto Seguro */}
      {selectedEvacPoint && (
        <div className="absolute top-4 right-4 z-30 max-w-sm w-full bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-emerald-500/50 animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-black text-sm text-white">{selectedEvacPoint.name}</h4>
            </div>
            <button
              onClick={() => setSelectedEvacPoint(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mb-2 leading-relaxed">{selectedEvacPoint.safeRoute}</p>
          <div className="text-[11px] font-mono text-emerald-300 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Capacidad: {selectedEvacPoint.capacity} personas</span>
            <span className="text-slate-400">{selectedEvacPoint.address}</span>
          </div>
        </div>
      )}

      {/* Tarjeta Flotante al Seleccionar un Tramo de Quebrada */}
      {selectedSegment && (
        <div className="absolute top-4 right-4 z-30 max-w-sm w-full bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: effectiveStatus === 'seguro' ? '#10b981' : riskPalette.borderColor }} />
              <h4 className="font-black text-sm text-white">{selectedSegment.name}</h4>
            </div>
            <button
              onClick={() => setSelectedSegment(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">{selectedSegment.description}</p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Cota segura oficial</span>
            <span className="text-emerald-400 font-bold">Sensor SIATA en línea</span>
          </div>
        </div>
      )}
    </div>
  );
};
