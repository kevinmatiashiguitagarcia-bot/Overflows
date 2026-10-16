/**
 * Precision GIS Coordinates & Cartography for Comuna 70 (Altavista) - Medellín
 * Strict geographic mapping for hydrological monitoring and early warning.
 */

export interface GisRiskSegment {
  id: string;
  name: string;
  riskLevel: 'bajo' | 'moderado' | 'alto' | 'critico';
  color: string;
  strokeWidth: number;
  description: string;
  coordinates: [number, number][]; // [lat, lng]
}

export interface GisSensorPoint {
  id: string;
  code: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  levelMeters: number;
  capacityPercentage: number;
  status: 'seguro' | 'alerta_amarilla' | 'alerta_naranja' | 'alerta_roja';
  trend: string;
  equipment: string;
  sectorName: string;
}

export interface GisEvacuationPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  address: string;
  safeRoute: string;
  contact: string;
}

export interface GisLandmarkPoint {
  id: string;
  name: string;
  type: 'puente' | 'escuela' | 'camara' | 'comunidad';
  lat: number;
  lng: number;
  description: string;
}

export interface GisQuebradaData {
  id: string;
  name: string;
  officialSector: string;
  basinAreaKm2: number;
  elevationRange: string;
  center: [number, number];
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  riskSegments: GisRiskSegment[];
  bufferZone: [number, number][]; // Hazard polygon
  sensors: GisSensorPoint[];
  evacuationPoints: GisEvacuationPoint[];
  landmarks: GisLandmarkPoint[];
}

export const GIS_QUEBRADAS: Record<string, GisQuebradaData> = {
  'la-picacha': {
    id: 'la-picacha',
    name: 'La Picacha',
    officialSector: 'Vereda Aguas Frías · Altos del Castillo · Las Brisas',
    basinAreaKm2: 9.8,
    elevationRange: '1,560 - 2,450 msnm',
    center: [6.2285, -75.6145],
    defaultZoom: 15,
    minZoom: 14,
    maxZoom: 18,
    bounds: [
      [6.2180, -75.6320],
      [6.2390, -75.5980]
    ],
    riskSegments: [
      {
        id: 'picacha-alto',
        name: 'Tramo Alto: Nacimiento Aguas Frías',
        riskLevel: 'bajo',
        color: '#10b981', // Verde
        strokeWidth: 5,
        description: 'Caudal con escorrentía libre. Vegetación densa de ladera alta.',
        coordinates: [
          [6.2235, -75.6265],
          [6.2248, -75.6235],
          [6.2259, -75.6205],
          [6.2268, -75.6180]
        ]
      },
      {
        id: 'picacha-medio',
        name: 'Tramo Medio: Escuela Aguas Frías - Morro Plan',
        riskLevel: 'moderado',
        color: '#eab308', // Amarillo
        strokeWidth: 6,
        description: 'Nivel bajo vigilancia. Sedimentos moderados tras lluvias en la cuenca alta.',
        coordinates: [
          [6.2268, -75.6180],
          [6.2280, -75.6162],
          [6.2295, -75.6145],
          [6.2305, -75.6125]
        ]
      },
      {
        id: 'picacha-castillo',
        name: 'Tramo Residencial: Altos del Castillo',
        riskLevel: 'alto',
        color: '#f97316', // Naranja
        strokeWidth: 7,
        description: 'Estrechamiento del cauce. Alerta preventiva para viviendas en cota baja.',
        coordinates: [
          [6.2305, -75.6125],
          [6.2315, -75.6105],
          [6.2325, -75.6085],
          [6.2332, -75.6068]
        ]
      },
      {
        id: 'picacha-brisas',
        name: 'Tramo Crítico: Puente Las Brisas (Calle 30)',
        riskLevel: 'critico',
        color: '#ef4444', // Rojo
        strokeWidth: 8,
        description: 'Punto de confluencia con Carrera 84. Riesgo de represamiento por empalizadas.',
        coordinates: [
          [6.2332, -75.6068],
          [6.2338, -75.6052],
          [6.2345, -75.6030],
          [6.2352, -75.6005]
        ]
      }
    ],
    bufferZone: [
      [6.2230, -75.6270],
      [6.2245, -75.6240],
      [6.2262, -75.6190],
      [6.2290, -75.6150],
      [6.2308, -75.6130],
      [6.2328, -75.6075],
      [6.2340, -75.6045],
      [6.2358, -75.6000],
      [6.2348, -75.5995],
      [6.2330, -75.6050],
      [6.2318, -75.6080],
      [6.2298, -75.6120],
      [6.2275, -75.6160],
      [6.2255, -75.6195],
      [6.2238, -75.6245],
      [6.2225, -75.6275]
    ],
    sensors: [
      {
        id: 'siata-picacha-1',
        code: 'SIATA-E104',
        name: 'Estación Radar Puente Las Brisas',
        lat: 6.2335,
        lng: -75.6060,
        elevation: 1610,
        levelMeters: 1.48,
        capacityPercentage: 74,
        status: 'alerta_naranja',
        trend: '+12 cm/h',
        equipment: 'Sensor Radar de Nivel SIATA + Pluviómetro',
        sectorName: 'Puente Las Brisas (Calle 30 con Cra 84)'
      },
      {
        id: 'siata-picacha-2',
        code: 'SIATA-E109',
        name: 'Sensor Aguas Frías Media',
        lat: 6.2268,
        lng: -75.6180,
        elevation: 1780,
        levelMeters: 0.95,
        capacityPercentage: 48,
        status: 'alerta_amarilla',
        trend: '+4 cm/h',
        equipment: 'Sensor Ultrasónico de Caudal',
        sectorName: 'Escuela Vereda Aguas Frías'
      },
      {
        id: 'siata-picacha-3',
        code: 'SIATA-E112',
        name: 'Sensor Nacimiento Cuenca Alta',
        lat: 6.2235,
        lng: -75.6265,
        elevation: 2150,
        levelMeters: 0.42,
        capacityPercentage: 21,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Estación Pluviométrica de Ladera',
        sectorName: 'Aguas Frías Alta'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-aguas-frias',
        name: 'Punto Seguro: Escuela Vereda Aguas Frías',
        lat: 6.2272,
        lng: -75.6185,
        capacity: 450,
        address: 'Calle 31A #105-20 (Vereda Aguas Frías)',
        safeRoute: 'Evacuar por la vía principal en ascenso, alejándose de los muros del cauce.',
        contact: 'Bomberos Medellín: 119'
      },
      {
        id: 'evac-castillo',
        name: 'Punto de Encuentro: Plazoleta Altos del Castillo',
        lat: 6.2315,
        lng: -75.6115,
        capacity: 350,
        address: 'Sector Altos del Castillo (Cota Alta)',
        safeRoute: 'Tomar la calle peatonal hacia la zona oriental alta, sin descender al puente.',
        contact: 'Bomberos Medellín: 119'
      }
    ],
    landmarks: [
      {
        id: 'lm-puente-brisas',
        name: 'Puente Peatonal y Vehicular Las Brisas',
        type: 'puente',
        lat: 6.2335,
        lng: -75.6060,
        description: 'Punto de mayor vulnerabilidad por desbordamiento en crecientes súbitas.'
      },
      {
        id: 'lm-escuela-aguas-frias',
        name: 'I.E. Vereda Aguas Frías',
        type: 'escuela',
        lat: 6.2270,
        lng: -75.6182,
        description: 'Sede educativa comunitaria y puesto de coordinación barrial.'
      },
      {
        id: 'lm-morro-plan',
        name: 'Sector Morro Plan',
        type: 'comunidad',
        lat: 6.2295,
        lng: -75.6145,
        description: 'Zona de viviendas en ladera con monitoreo de estabilidad de taludes.'
      }
    ]
  },
  'altavista': {
    id: 'altavista',
    name: 'Altavista (Cauce Principal)',
    officialSector: 'Vereda San Pablo · El Chispero · Parque Altavista',
    basinAreaKm2: 18.4,
    elevationRange: '1,540 - 2,750 msnm',
    center: [6.2195, -75.6180],
    defaultZoom: 15,
    minZoom: 14,
    maxZoom: 18,
    bounds: [
      [6.2080, -75.6380],
      [6.2300, -75.6020]
    ],
    riskSegments: [
      {
        id: 'altavista-alto',
        name: 'Tramo Alto: Vereda Buga - Patio Bonito',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Cauce rocoso con alta pendiente. Escorrentía rápida.',
        coordinates: [
          [6.2135, -75.6330],
          [6.2150, -75.6295],
          [6.2165, -75.6260],
          [6.2180, -75.6225]
        ]
      },
      {
        id: 'altavista-medio',
        name: 'Tramo Medio: Parque Central - Coliseo Parroquial',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 6,
        description: 'Sección canalizada con muros de contención en buen estado.',
        coordinates: [
          [6.2180, -75.6225],
          [6.2195, -75.6190],
          [6.2210, -75.6160],
          [6.2225, -75.6125]
        ]
      },
      {
        id: 'altavista-sanpablo',
        name: 'Tramo San Pablo: Confluencia Las Cañadas',
        riskLevel: 'moderado',
        color: '#eab308',
        strokeWidth: 7,
        description: 'Vigilancia activa en el puente peatonal de Calle 18.',
        coordinates: [
          [6.2225, -75.6125],
          [6.2238, -75.6090],
          [6.2250, -75.6055],
          [6.2260, -75.6030]
        ]
      }
    ],
    bufferZone: [
      [6.2130, -75.6335],
      [6.2160, -75.6270],
      [6.2185, -75.6210],
      [6.2215, -75.6150],
      [6.2245, -75.6080],
      [6.2265, -75.6025],
      [6.2255, -75.6020],
      [6.2235, -75.6075],
      [6.2205, -75.6145],
      [6.2175, -75.6215],
      [6.2145, -75.6280],
      [6.2120, -75.6340]
    ],
    sensors: [
      {
        id: 'siata-altavista-1',
        code: 'SIATA-E101',
        name: 'Estación Central Puente Altavista',
        lat: 6.2210,
        lng: -75.6160,
        elevation: 1680,
        levelMeters: 0.62,
        capacityPercentage: 31,
        status: 'seguro',
        trend: 'Estable (-2 cm/h)',
        equipment: 'Radar de nivel milimétrico SIATA',
        sectorName: 'Parque Principal de Altavista'
      },
      {
        id: 'siata-altavista-2',
        code: 'SIATA-E102',
        name: 'Sensor San Pablo - Calle 18',
        lat: 6.2238,
        lng: -75.6090,
        elevation: 1625,
        levelMeters: 0.78,
        capacityPercentage: 39,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor hidrométrico ultrasónico',
        sectorName: 'Vereda San Pablo'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-coliseo-altavista',
        name: 'Punto Seguro: Coliseo Parroquial Altavista',
        lat: 6.2215,
        lng: -75.6165,
        capacity: 600,
        address: 'Carrera 84 #18-35 (Frente al Parque Principal)',
        safeRoute: 'Subir hacia el parque principal por las vías asfaltadas.',
        contact: 'Bomberos Medellín: 119'
      },
      {
        id: 'evac-cancha-sanpablo',
        name: 'Punto de Encuentro: Cancha San Pablo',
        lat: 6.2245,
        lng: -75.6080,
        capacity: 500,
        address: 'Calle 18 Sector San Pablo',
        safeRoute: 'Evacuar hacia la parte alta de la vereda San Pablo.',
        contact: 'Bomberos Medellín: 119'
      }
    ],
    landmarks: [
      {
        id: 'lm-parque-altavista',
        name: 'Parque Central Corregimiento Altavista',
        type: 'comunidad',
        lat: 6.2210,
        lng: -75.6160,
        description: 'Centro cívico, estación de policía y casa de gobierno local.'
      },
      {
        id: 'lm-puente-calle18',
        name: 'Puente Calle 18 San Pablo',
        type: 'puente',
        lat: 6.2238,
        lng: -75.6090,
        description: 'Paso peatonal y vehicular sobre el cauce central de Altavista.'
      }
    ]
  },
  'buenavista': {
    id: 'buenavista',
    name: 'Quebrada Buenavista',
    officialSector: 'Vereda El Corazón · El Morro · Ladrilleras San Judas',
    basinAreaKm2: 6.5,
    elevationRange: '1,600 - 2,380 msnm',
    center: [6.2385, -75.6145],
    defaultZoom: 15,
    minZoom: 14,
    maxZoom: 18,
    bounds: [
      [6.2300, -75.6260],
      [6.2460, -75.6030]
    ],
    riskSegments: [
      {
        id: 'buenavista-alto',
        name: 'Tramo Nacimiento El Morro',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Alta pendiente con libre drenaje hacia el sector El Salado.',
        coordinates: [
          [6.2425, -75.6210],
          [6.2410, -75.6185],
          [6.2395, -75.6160]
        ]
      },
      {
        id: 'buenavista-medio',
        name: 'Tramo Vereda El Corazón',
        riskLevel: 'moderado',
        color: '#eab308',
        strokeWidth: 6,
        description: 'Monitoreo de turbidez y material vegetal en tramo residencial.',
        coordinates: [
          [6.2395, -75.6160],
          [6.2380, -75.6135],
          [6.2365, -75.6105]
        ]
      }
    ],
    bufferZone: [
      [6.2430, -75.6215],
      [6.2405, -75.6175],
      [6.2385, -75.6130],
      [6.2360, -75.6095],
      [6.2355, -75.6105],
      [6.2375, -75.6145],
      [6.2400, -75.6190],
      [6.2420, -75.6225]
    ],
    sensors: [
      {
        id: 'siata-buenavista-1',
        code: 'SIATA-E108',
        name: 'Estación Buenavista El Salado',
        lat: 6.2380,
        lng: -75.6135,
        elevation: 1720,
        levelMeters: 0.88,
        capacityPercentage: 44,
        status: 'alerta_amarilla',
        trend: '+10 cm/h',
        equipment: 'Sensor de nivel por radar',
        sectorName: 'Vereda El Corazón - El Salado'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-cancha-el-salado',
        name: 'Punto Seguro: Cancha El Salado (Vereda El Corazón)',
        lat: 6.2385,
        lng: -75.6125,
        capacity: 500,
        address: 'Vereda El Corazón (Límite Norte Seguro)',
        safeRoute: 'Evacuar hacia la parte alta de la cancha polideportiva.',
        contact: 'Bomberos Medellín: 119'
      }
    ],
    landmarks: [
      {
        id: 'lm-cancha-corazon',
        name: 'Cancha Polideportiva El Corazón',
        type: 'comunidad',
        lat: 6.2385,
        lng: -75.6125,
        description: 'Punto de encuentro y helipuerto de rescate ante emergencias.'
      }
    ]
  },
  'la-guayabala': {
    id: 'la-guayabala',
    name: 'Quebrada La Guayabala',
    officialSector: 'Vereda San José del Manzanillo · El Jardín',
    basinAreaKm2: 8.2,
    elevationRange: '1,590 - 2,520 msnm',
    center: [6.2110, -75.6150],
    defaultZoom: 15,
    minZoom: 14,
    maxZoom: 18,
    bounds: [
      [6.2020, -75.6270],
      [6.2200, -75.6040]
    ],
    riskSegments: [
      {
        id: 'guayabala-alto',
        name: 'Tramo San José del Manzanillo',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Buen retiro hídrico y sin obstrucciones en el lecho.',
        coordinates: [
          [6.2075, -75.6220],
          [6.2090, -75.6185],
          [6.2105, -75.6150]
        ]
      },
      {
        id: 'guayabala-jardin',
        name: 'Tramo El Jardín',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 6,
        description: 'Capacidad adecuada y monitoreo con cámara comunitaria.',
        coordinates: [
          [6.2105, -75.6150],
          [6.2120, -75.6120],
          [6.2135, -75.6090]
        ]
      }
    ],
    bufferZone: [
      [6.2070, -75.6225],
      [6.2095, -75.6170],
      [6.2125, -75.6105],
      [6.2115, -75.6100],
      [6.2085, -75.6165],
      [6.2065, -75.6220]
    ],
    sensors: [
      {
        id: 'siata-guayabala-1',
        code: 'SIATA-E107',
        name: 'Estación Hidrométrica Manzanillo',
        lat: 6.2105,
        lng: -75.6150,
        elevation: 1690,
        levelMeters: 0.54,
        capacityPercentage: 27,
        status: 'seguro',
        trend: 'Estable (-1 cm/h)',
        equipment: 'Sensor ultrasónico de nivel',
        sectorName: 'Vereda San José del Manzanillo'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-cancha-manzanillo',
        name: 'Punto de Encuentro: Cancha Manzanillo',
        lat: 6.2115,
        lng: -75.6140,
        capacity: 400,
        address: 'Vereda San José del Manzanillo (Cota Alta)',
        safeRoute: 'Evacuar hacia la cancha polideportiva por la vía principal.',
        contact: 'Bomberos Medellín: 119'
      }
    ],
    landmarks: [
      {
        id: 'lm-manzanillo-escuela',
        name: 'Sede Educativa San José del Manzanillo',
        type: 'escuela',
        lat: 6.2108,
        lng: -75.6155,
        description: 'Punto de coordinación vecinal y monitoreo local.'
      }
    ]
  },
  'la-canada': {
    id: 'la-canada',
    name: 'Quebrada Las Cañadas',
    officialSector: 'Vereda La Esperanza · Sector El Chispero',
    basinAreaKm2: 4.3,
    elevationRange: '1,620 - 2,240 msnm',
    center: [6.2205, -75.6210],
    defaultZoom: 15,
    minZoom: 14,
    maxZoom: 18,
    bounds: [
      [6.2120, -75.6320],
      [6.2280, -75.6110]
    ],
    riskSegments: [
      {
        id: 'canada-alto',
        name: 'Tramo La Esperanza Alta',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Nacimiento en cota 2,180 msnm. Escorrentía limpia.',
        coordinates: [
          [6.2170, -75.6275],
          [6.2185, -75.6250],
          [6.2200, -75.6225]
        ]
      },
      {
        id: 'canada-medio',
        name: 'Tramo El Chispero - Desembocadura',
        riskLevel: 'moderado',
        color: '#eab308',
        strokeWidth: 6,
        description: 'Descenso por ladera El Chispero hacia la margen de Altavista.',
        coordinates: [
          [6.2200, -75.6225],
          [6.2215, -75.6200],
          [6.2225, -75.6175]
        ]
      }
    ],
    bufferZone: [
      [6.2165, -75.6280],
      [6.2195, -75.6235],
      [6.2225, -75.6185],
      [6.2215, -75.6180],
      [6.2185, -75.6230],
      [6.2160, -75.6275]
    ],
    sensors: [
      {
        id: 'siata-canada-1',
        code: 'SIATA-E106',
        name: 'Sensor Nivel El Chispero',
        lat: 6.2205,
        lng: -75.6210,
        elevation: 1740,
        levelMeters: 0.72,
        capacityPercentage: 36,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor hidrométrico SIATA',
        sectorName: 'Sector El Chispero / La Esperanza'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-esperanza',
        name: 'Punto Seguro: Sede Comunal La Esperanza',
        lat: 6.2212,
        lng: -75.6215,
        capacity: 300,
        address: 'Vereda La Esperanza Sector Central',
        safeRoute: 'Subir por el sendero comunal pavimentado.',
        contact: 'Bomberos Medellín: 119'
      }
    ],
    landmarks: [
      {
        id: 'lm-chispero-puente',
        name: 'Puente Peatonal El Chispero',
        type: 'puente',
        lat: 6.2210,
        lng: -75.6205,
        description: 'Cruce peatonal sobre la quebrada Las Cañadas.'
      }
    ]
  }
};
