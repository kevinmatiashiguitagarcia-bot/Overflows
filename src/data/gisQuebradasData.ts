/**
 * Cartografía de Precisión GIS y Red Hidrológica Oficial SIATA - Comuna 70 (Altavista), Medellín
 * Georreferenciación de alta fidelidad basada en la red hidrográfica de cuencas de la Alcaldía de Medellín y SIATA.
 * 
 * Trazados estrictos a lo largo del lecho natural de los cañones y quebradas (sin cortar viviendas).
 * Franjas de retiro de 30m y Puntos Seguros en cota alta fuera de la llanura de inundación.
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
  bufferZone: [number, number][]; // Franja de Retiro Hidrológico (30m)
  sensors: GisSensorPoint[];
  evacuationPoints: GisEvacuationPoint[];
  landmarks: GisLandmarkPoint[];
}

export const GIS_QUEBRADAS: Record<string, GisQuebradaData> = {
  // -------------------------------------------------------------------------
  // 1. QUEBRADA ALTAVISTA (Cauce Principal de la Comuna 70)
  // Eje vertebral que nace en la unión de Q. Buga y Q. El Barcino en Patio Bonito,
  // recorre el fondo del valle junto a la vía principal, San Pablo y Parque Central.
  // -------------------------------------------------------------------------
  'altavista': {
    id: 'altavista',
    name: 'Quebrada Altavista (Cauce Principal)',
    officialSector: 'Veredas Buga · Patio Bonito · San Pablo · Sector Central',
    basinAreaKm2: 18.4,
    elevationRange: '1,540 - 2,750 msnm',
    center: [6.2215, -75.6160],
    defaultZoom: 15,
    minZoom: 13,
    maxZoom: 19,
    bounds: [
      [6.2050, -75.6350],
      [6.2300, -75.6020]
    ],
    riskSegments: [
      {
        id: 'altavista-nacimiento',
        name: 'Tramo Alto: Confluencia Buga - Patio Bonito',
        riskLevel: 'bajo',
        color: '#10b981', // Verde en condiciones seguras
        strokeWidth: 5,
        description: 'Cauce natural rocoso en la alta montaña. Retiro natural amplio.',
        coordinates: [
          [6.2085, -75.6320],
          [6.2110, -75.6295],
          [6.2135, -75.6265],
          [6.2160, -75.6235],
          [6.2185, -75.6205]
        ]
      },
      {
        id: 'altavista-centro',
        name: 'Tramo Medio: Parque Central Altavista - Coliseo',
        riskLevel: 'bajo',
        color: '#10b981', // Verde en condiciones seguras
        strokeWidth: 6,
        description: 'Canalización y muros de contención en cota urbana central.',
        coordinates: [
          [6.2185, -75.6205],
          [6.2200, -75.6180],
          [6.2212, -75.6158],
          [6.2225, -75.6135],
          [6.2235, -75.6110]
        ]
      },
      {
        id: 'altavista-sanpablo',
        name: 'Tramo Bajo: San Pablo - Desembocadura Belén Rincón',
        riskLevel: 'bajo',
        color: '#10b981', // Verde en condiciones seguras
        strokeWidth: 6,
        description: 'Confluencia con afluentes menores. Monitoreo permanente estación SIATA #308.',
        coordinates: [
          [6.2235, -75.6110],
          [6.2245, -75.6085],
          [6.2255, -75.6055],
          [6.2265, -75.6025]
        ]
      }
    ],
    // Franja de retiro de 30m paralela al cauce natural
    bufferZone: [
      [6.2088, -75.6325],
      [6.2113, -75.6300],
      [6.2138, -75.6270],
      [6.2163, -75.6240],
      [6.2188, -75.6210],
      [6.2203, -75.6185],
      [6.2215, -75.6162],
      [6.2228, -75.6138],
      [6.2238, -75.6113],
      [6.2248, -75.6088],
      [6.2258, -75.6058],
      [6.2268, -75.6028],
      // Retorno por la margen contraria (+30m)
      [6.2262, -75.6022],
      [6.2252, -75.6052],
      [6.2242, -75.6082],
      [6.2232, -75.6107],
      [6.2222, -75.6132],
      [6.2209, -75.6154],
      [6.2197, -75.6175],
      [6.2182, -75.6200],
      [6.2157, -75.6230],
      [6.2132, -75.6260],
      [6.2107, -75.6290],
      [6.2082, -75.6315]
    ],
    sensors: [
      {
        id: 'siata-altavista-1',
        code: 'SIATA-H308',
        name: 'Estación Hidrológica SIATA #308 (Puente San Pablo)',
        lat: 6.2238,
        lng: -75.6090,
        elevation: 1625,
        levelMeters: 0.68,
        capacityPercentage: 27,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor Radar Milimétrico SIATA',
        sectorName: 'Vereda San Pablo (Calle 18)'
      },
      {
        id: 'siata-altavista-2',
        code: 'SIATA-H309',
        name: 'Sensor Nivel Parque Central Altavista',
        lat: 6.2212,
        lng: -75.6158,
        elevation: 1680,
        levelMeters: 0.60,
        capacityPercentage: 25,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor Ultrasónico de Cota Hidráulica',
        sectorName: 'Parque Principal Corregimiento Altavista'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-coliseo-altavista',
        name: 'Punto Seguro Oficial: Coliseo Parroquial y Parque Central',
        lat: 6.2215,
        lng: -75.6165,
        capacity: 650,
        address: 'Carrera 84 #18-35 (Frente al Parque Principal Altavista)',
        safeRoute: 'Evacuar por la calzada principal hacia la plaza central elevada fuera del canal.',
        contact: 'Línea 123 Medellín / Bomberos Altavista'
      },
      {
        id: 'evac-cancha-sanpablo',
        name: 'Punto de Encuentro: Cancha Polideportiva San Pablo',
        lat: 6.2245,
        lng: -75.6080,
        capacity: 500,
        address: 'Sector San Pablo (Plaza Deportiva Cota Alta)',
        safeRoute: 'Subir por el acceso peatonal hacia la cancha alta de San Pablo.',
        contact: 'Comité Barrial de Emergencias'
      }
    ],
    landmarks: [
      {
        id: 'lm-parque-altavista',
        name: 'Parque Central Corregimiento Altavista',
        type: 'comunidad',
        lat: 6.2210,
        lng: -75.6160,
        description: 'Sede corregimental, Casa de Gobierno y centro de acopio comunal.'
      },
      {
        id: 'lm-puente-sanpablo',
        name: 'Puente Calle 18 Sector San Pablo',
        type: 'puente',
        lat: 6.2238,
        lng: -75.6090,
        description: 'Paso vehicular principal con regla hidrométrica de cota de desbordamiento.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 2. QUEBRADA LA PICACHA / AGUAS FRÍAS
  // Nace en Alto de los Santeros, serpentea por Vereda Aguas Frías pasando por la
  // Droguería, bordea la vaguada sur de Altos del Castillo y la U. de Medellín.
  // -------------------------------------------------------------------------
  'la-picacha': {
    id: 'la-picacha',
    name: 'Quebrada La Picacha (Aguas Frías)',
    officialSector: 'Vereda Aguas Frías · Altos del Castillo · Universidad de Medellín',
    basinAreaKm2: 9.8,
    elevationRange: '1,510 - 2,450 msnm',
    center: [6.2290, -75.6165],
    defaultZoom: 15,
    minZoom: 13,
    maxZoom: 19,
    bounds: [
      [6.2180, -75.6320],
      [6.2380, -75.6000]
    ],
    riskSegments: [
      {
        id: 'picacha-alto',
        name: 'Tramo Alto: Alto de los Santeros - Nacimiento',
        riskLevel: 'bajo',
        color: '#10b981', // Verde en condiciones seguras
        strokeWidth: 5,
        description: 'Cauce de montaña con vegetación densa y libre escorrentía.',
        coordinates: [
          [6.2225, -75.6285],
          [6.2245, -75.6250],
          [6.2265, -75.6215],
          [6.2280, -75.6185]
        ]
      },
      {
        id: 'picacha-aguasfrias',
        name: 'Tramo Vereda Aguas Frías (Sector Droguería)',
        riskLevel: 'bajo',
        color: '#10b981', // Verde en condiciones seguras
        strokeWidth: 6,
        description: 'Recorrido por la vaguada natural junto a la vía principal de Aguas Frías.',
        coordinates: [
          [6.2280, -75.6185],
          [6.2292, -75.6165],
          [6.2302, -75.6140],
          [6.2310, -75.6115]
        ]
      },
      {
        id: 'picacha-udem',
        name: 'Tramo Altos del Castillo - Universidad de Medellín',
        riskLevel: 'bajo',
        color: '#10b981', // Verde en condiciones seguras
        strokeWidth: 6,
        description: 'Canal abierto paralelo a Calle 31B y costado sur del campus universitario.',
        coordinates: [
          [6.2310, -75.6115],
          [6.2318, -75.6085],
          [6.2325, -75.6055],
          [6.2330, -75.6025]
        ]
      }
    ],
    bufferZone: [
      [6.2228, -75.6290],
      [6.2248, -75.6255],
      [6.2268, -75.6220],
      [6.2283, -75.6190],
      [6.2295, -75.6170],
      [6.2305, -75.6145],
      [6.2313, -75.6120],
      [6.2321, -75.6090],
      [6.2328, -75.6060],
      [6.2333, -75.6030],
      // Retorno
      [6.2327, -75.6020],
      [6.2322, -75.6050],
      [6.2315, -75.6080],
      [6.2307, -75.6110],
      [6.2299, -75.6135],
      [6.2289, -75.6160],
      [6.2277, -75.6180],
      [6.2262, -75.6210],
      [6.2242, -75.6245],
      [6.2222, -75.6280]
    ],
    sensors: [
      {
        id: 'siata-picacha-1',
        code: 'SIATA-H405',
        name: 'Estación Hidrológica SIATA #405 (Aguas Frías)',
        lat: 6.2272,
        lng: -75.6185,
        elevation: 1780,
        levelMeters: 0.62,
        capacityPercentage: 26,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Radar Hidrométrico Ultrasónico SIATA',
        sectorName: 'Vereda Aguas Frías'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-aguas-frias',
        name: 'Punto Seguro Oficial: Placa Polideportiva Aguas Frías',
        lat: 6.2295,
        lng: -75.6180,
        capacity: 450,
        address: 'Sector Escuela Aguas Frías (Calle 31A en Cota Alta)',
        safeRoute: 'Evacuar por la vía asfaltada hacia la placa polideportiva alejada del muro del cauce.',
        contact: 'Línea 123 Medellín / Bomberos'
      },
      {
        id: 'evac-castillo',
        name: 'Punto de Encuentro: Plazoleta Superior Altos del Castillo',
        lat: 6.2315,
        lng: -75.6125,
        capacity: 380,
        address: 'Altos del Castillo Etapa 1 (Terraza Alta)',
        safeRoute: 'Subir hacia las plazoletas superiores de los bloques residenciales.',
        contact: 'Administración Altos del Castillo'
      }
    ],
    landmarks: [
      {
        id: 'lm-drogueria-aguasfrias',
        name: 'Sector Droguería Aguas Frías',
        type: 'comunidad',
        lat: 6.2290,
        lng: -75.6168,
        description: 'Referencia cívica y comercial sobre el eje de la Calle 31B.'
      },
      {
        id: 'lm-puente-brisas',
        name: 'Puente Las Brisas (Calle 30)',
        type: 'puente',
        lat: 6.2330,
        lng: -75.6030,
        description: 'Transición hacia el canal urbano de Los Molinos.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 3. QUEBRADA BUENAVISTA
  // Drena el flanco norte desde el Cerro Padre Amaya hacia Vereda El Morro y El Corazón.
  // -------------------------------------------------------------------------
  'buenavista': {
    id: 'buenavista',
    name: 'Quebrada Buenavista',
    officialSector: 'Cerro Padre Amaya · Vereda El Morro · Ladrilleras San Judas',
    basinAreaKm2: 6.5,
    elevationRange: '1,600 - 2,620 msnm',
    center: [6.2395, -75.6160],
    defaultZoom: 15,
    minZoom: 13,
    maxZoom: 19,
    bounds: [
      [6.2300, -75.6260],
      [6.2460, -75.6030]
    ],
    riskSegments: [
      {
        id: 'buenavista-alto',
        name: 'Tramo Alto: Cañón Cerro Padre Amaya',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Pendiente escarpada en macizo rocoso de Padre Amaya.',
        coordinates: [
          [6.2435, -75.6225],
          [6.2415, -75.6195],
          [6.2395, -75.6165]
        ]
      },
      {
        id: 'buenavista-morro',
        name: 'Tramo Vereda El Morro - El Corazón',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 6,
        description: 'Paso por el sector de canteras y Escuela Buenavista.',
        coordinates: [
          [6.2395, -75.6165],
          [6.2375, -75.6135],
          [6.2355, -75.6100]
        ]
      }
    ],
    bufferZone: [
      [6.2438, -75.6230],
      [6.2418, -75.6200],
      [6.2398, -75.6170],
      [6.2378, -75.6140],
      [6.2358, -75.6105],
      // Retorno
      [6.2352, -75.6095],
      [6.2372, -75.6130],
      [6.2392, -75.6160],
      [6.2412, -75.6190],
      [6.2432, -75.6220]
    ],
    sensors: [
      {
        id: 'siata-buenavista-1',
        code: 'SIATA-H512',
        name: 'Estación Pluviométrica y Nivel SIATA #512',
        lat: 6.2380,
        lng: -75.6135,
        elevation: 1720,
        levelMeters: 0.55,
        capacityPercentage: 24,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor Óptico SIATA',
        sectorName: 'Vereda El Morro'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-cancha-el-salado',
        name: 'Punto Seguro Oficial: Cancha Vereda El Corazón',
        lat: 6.2385,
        lng: -75.6120,
        capacity: 450,
        address: 'Sector Cancha Polideportiva El Corazón (Cota Alta)',
        safeRoute: 'Evacuar hacia la explanada deportiva por la vía pavimentada.',
        contact: 'Línea 123 Medellín'
      }
    ],
    landmarks: [
      {
        id: 'lm-escuela-buenavista',
        name: 'I.E. Altavista Sede Buenavista',
        type: 'escuela',
        lat: 6.2385,
        lng: -75.6128,
        description: 'Sede escolar comunitaria y albergue preventivo.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 4. QUEBRADA LAS CAÑADAS (LA ESPERANZA)
  // Afluente que desciende por la ladera este de La Esperanza y El Chispero
  // hasta confluir con la Quebrada Altavista en San Pablo.
  // -------------------------------------------------------------------------
  'la-canada': {
    id: 'la-canada',
    name: 'Quebrada Las Cañadas',
    officialSector: 'Vereda La Esperanza · Sector El Chispero',
    basinAreaKm2: 4.3,
    elevationRange: '1,620 - 2,240 msnm',
    center: [6.2225, -75.6185],
    defaultZoom: 15,
    minZoom: 13,
    maxZoom: 19,
    bounds: [
      [6.2150, -75.6300],
      [6.2280, -75.6100]
    ],
    riskSegments: [
      {
        id: 'canada-alto',
        name: 'Tramo Alto: Vereda La Esperanza Alta',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Nacimiento rural a 2,180 msnm con lecho natural limpio.',
        coordinates: [
          [6.2255, -75.6240],
          [6.2240, -75.6210],
          [6.2230, -75.6180]
        ]
      },
      {
        id: 'canada-chispero',
        name: 'Tramo El Chispero - Confluencia San Pablo',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 6,
        description: 'Paso por el puente peatonal Calle 18A hacia la Quebrada Altavista.',
        coordinates: [
          [6.2230, -75.6180],
          [6.2225, -75.6150],
          [6.2235, -75.6110]
        ]
      }
    ],
    bufferZone: [
      [6.2258, -75.6245],
      [6.2243, -75.6215],
      [6.2233, -75.6185],
      [6.2228, -75.6155],
      [6.2238, -75.6115],
      // Retorno
      [6.2232, -75.6105],
      [6.2222, -75.6145],
      [6.2227, -75.6175],
      [6.2237, -75.6205],
      [6.2252, -75.6235]
    ],
    sensors: [
      {
        id: 'siata-canada-1',
        code: 'SIATA-H215',
        name: 'Estación Nivel SIATA #215 (El Chispero)',
        lat: 6.2205,
        lng: -75.6210,
        elevation: 1740,
        levelMeters: 0.45,
        capacityPercentage: 22,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor Hidrométrico SIATA',
        sectorName: 'Sector El Chispero'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-esperanza',
        name: 'Punto Seguro Oficial: Sede Comunal La Esperanza',
        lat: 6.2240,
        lng: -75.6200,
        capacity: 350,
        address: 'Vereda La Esperanza (Plazoleta Comunal)',
        safeRoute: 'Subir hacia la sede comunal por el sendero pavimentado.',
        contact: 'Línea 123 Medellín'
      }
    ],
    landmarks: [
      {
        id: 'lm-chispero-puente',
        name: 'Puente Peatonal Calle 18A El Chispero',
        type: 'puente',
        lat: 6.2225,
        lng: -75.6150,
        description: 'Conexión peatonal barrial entre El Chispero y San Pablo.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 5. QUEBRADA LA GUAYABALA
  // Cuenca sur de Comuna 70 que recorre San José del Manzanillo, El Jardín y Las Camelias.
  // -------------------------------------------------------------------------
  'la-guayabala': {
    id: 'la-guayabala',
    name: 'Quebrada La Guayabala',
    officialSector: 'Vereda San José del Manzanillo · El Jardín · Las Camelias',
    basinAreaKm2: 8.2,
    elevationRange: '1,590 - 2,520 msnm',
    center: [6.2105, -75.6150],
    defaultZoom: 15,
    minZoom: 13,
    maxZoom: 19,
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
        description: 'Reserva Manzanillo hacia la vereda central.',
        coordinates: [
          [6.2075, -75.6220],
          [6.2090, -75.6185],
          [6.2105, -75.6150]
        ]
      },
      {
        id: 'guayabala-jardin',
        name: 'Tramo Vereda El Jardín - Las Camelias',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 6,
        description: 'Vía rural en descenso hacia Rodeo Alto.',
        coordinates: [
          [6.2105, -75.6150],
          [6.2120, -75.6120],
          [6.2135, -75.6085]
        ]
      }
    ],
    bufferZone: [
      [6.2078, -75.6225],
      [6.2093, -75.6190],
      [6.2108, -75.6155],
      [6.2123, -75.6125],
      [6.2138, -75.6090],
      // Retorno
      [6.2132, -75.6080],
      [6.2117, -75.6115],
      [6.2102, -75.6145],
      [6.2087, -75.6180],
      [6.2072, -75.6215]
    ],
    sensors: [
      {
        id: 'siata-guayabala-1',
        code: 'SIATA-H618',
        name: 'Estación Hidrológica SIATA #618 (Manzanillo)',
        lat: 6.2105,
        lng: -75.6150,
        elevation: 1690,
        levelMeters: 0.52,
        capacityPercentage: 25,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor Ultrasónico SIATA',
        sectorName: 'San José del Manzanillo'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-cancha-manzanillo',
        name: 'Punto Seguro Oficial: Cancha Manzanillo',
        lat: 6.2115,
        lng: -75.6140,
        capacity: 400,
        address: 'Vereda San José del Manzanillo (Cota Alta)',
        safeRoute: 'Evacuar hacia la placa polideportiva por la vía principal.',
        contact: 'Línea 123 Medellín'
      }
    ],
    landmarks: [
      {
        id: 'lm-manzanillo-escuela',
        name: 'Sede Educativa San José del Manzanillo',
        type: 'escuela',
        lat: 6.2108,
        lng: -75.6155,
        description: 'Centro de coordinación comunal y albergue preventivo.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 6. QUEBRADA EL PELÓN (Afluente Sur Manzanillo)
  // -------------------------------------------------------------------------
  'el-pelon': {
    id: 'el-pelon',
    name: 'Quebrada El Pelón',
    officialSector: 'Sector San José · Manzanillo Alto',
    basinAreaKm2: 2.1,
    elevationRange: '1,730 - 2,120 msnm',
    center: [6.2120, -75.6170],
    defaultZoom: 16,
    minZoom: 13,
    maxZoom: 19,
    bounds: [
      [6.2080, -75.6230],
      [6.2160, -75.6120]
    ],
    riskSegments: [
      {
        id: 'pelon-tramo',
        name: 'Tramo Veredal San José Alto',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Cauce de montaña sobre ladera con vegetación de protección.',
        coordinates: [
          [6.2140, -75.6200],
          [6.2128, -75.6180],
          [6.2115, -75.6160],
          [6.2105, -75.6150]
        ]
      }
    ],
    bufferZone: [
      [6.2143, -75.6205],
      [6.2131, -75.6185],
      [6.2118, -75.6165],
      [6.2108, -75.6155],
      // Retorno
      [6.2102, -75.6145],
      [6.2112, -75.6155],
      [6.2125, -75.6175],
      [6.2137, -75.6195]
    ],
    sensors: [
      {
        id: 'siata-pelon-1',
        code: 'SIATA-H621',
        name: 'Estación Hidrológica SIATA #621 (Manzanillo Alto)',
        lat: 6.2120,
        lng: -75.6190,
        elevation: 1820,
        levelMeters: 0.35,
        capacityPercentage: 20,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor Hidrométrico de Ladera SIATA',
        sectorName: 'Sector San José Alto'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-pelon-manzanillo',
        name: 'Punto Seguro: Salón Comunal Vereda Manzanillo',
        lat: 6.2115,
        lng: -75.6140,
        capacity: 250,
        address: 'Vereda San José del Manzanillo (Cota Alta)',
        safeRoute: 'Evacuar hacia la explanada comunitaria alta fuera del lecho.',
        contact: 'Línea 123 Medellín'
      }
    ],
    landmarks: [
      {
        id: 'lm-pelon-camino',
        name: 'Camino Veredal Manzanillo Alto',
        type: 'comunidad',
        lat: 6.2125,
        lng: -75.6175,
        description: 'Vía rural de conectividad veredal.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 7. QUEBRADA ANA DÍAZ (Límite Comuna 70 / Belén Rincón)
  // -------------------------------------------------------------------------
  'ana-diaz': {
    id: 'ana-diaz',
    name: 'Quebrada Ana Díaz',
    officialSector: 'Límites Comuna 70 con Belén Rincón',
    basinAreaKm2: 3.4,
    elevationRange: '1,560 - 2,210 msnm',
    center: [6.2410, -75.6120],
    defaultZoom: 15,
    minZoom: 13,
    maxZoom: 19,
    bounds: [
      [6.2340, -75.6200],
      [6.2460, -75.6050]
    ],
    riskSegments: [
      {
        id: 'anadiaz-tramo',
        name: 'Tramo de Ladera Altavista - Belén Rincón',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Corredor natural de drenaje oriental.',
        coordinates: [
          [6.2435, -75.6155],
          [6.2418, -75.6130],
          [6.2398, -75.6100],
          [6.2378, -75.6075]
        ]
      }
    ],
    bufferZone: [
      [6.2438, -75.6160],
      [6.2421, -75.6135],
      [6.2401, -75.6105],
      [6.2381, -75.6080],
      // Retorno
      [6.2375, -75.6070],
      [6.2395, -75.6095],
      [6.2415, -75.6125],
      [6.2432, -75.6150]
    ],
    sensors: [
      {
        id: 'siata-anadiaz-1',
        code: 'SIATA-H314',
        name: 'Estación Nivel SIATA #314 (Ana Díaz)',
        lat: 6.2430,
        lng: -75.6160,
        elevation: 1580,
        levelMeters: 0.48,
        capacityPercentage: 23,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor de Nivel SIATA',
        sectorName: 'Límites Comuna 70 · Belén Rincón'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-anadiaz',
        name: 'Punto Seguro Oficial: Placa Deportiva Belén Rincón Alta',
        lat: 6.2405,
        lng: -75.6080,
        capacity: 350,
        address: 'Sector Rincón Alto (Cota Alta)',
        safeRoute: 'Subir hacia la placa deportiva alejada del cauce.',
        contact: 'Línea 123 Medellín'
      }
    ],
    landmarks: [
      {
        id: 'lm-anadiaz-puente',
        name: 'Paso Vía Principal Ana Díaz',
        type: 'puente',
        lat: 6.2415,
        lng: -75.6125,
        description: 'Punto de cruce vial y regla de aforo SIATA.'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 8. RED COMPLETA DE MICROCUENCAS COMUNA 70 (Vista Supervisión)
  // -------------------------------------------------------------------------
  'red-comuna-70': {
    id: 'red-comuna-70',
    name: 'Red Hidrográfica Comuna 70',
    officialSector: 'Corregimiento Altavista · Todas las Cuencas',
    basinAreaKm2: 38.6,
    elevationRange: '1,510 - 2,750 msnm',
    center: [6.2230, -75.6150],
    defaultZoom: 14,
    minZoom: 12,
    maxZoom: 19,
    bounds: [
      [6.2020, -75.6350],
      [6.2470, -75.6020]
    ],
    riskSegments: [
      // 1. Eje Altavista
      {
        id: 'red-altavista',
        name: 'Cauce Principal: Quebrada Altavista',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 6,
        description: 'Eje central desde Patio Bonito hasta Belén.',
        coordinates: [
          [6.2085, -75.6320],
          [6.2135, -75.6265],
          [6.2185, -75.6205],
          [6.2212, -75.6158],
          [6.2235, -75.6110],
          [6.2255, -75.6055],
          [6.2265, -75.6025]
        ]
      },
      // 2. La Picacha
      {
        id: 'red-picacha',
        name: 'Quebrada La Picacha / Aguas Frías',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Vereda Aguas Frías y Calle 30.',
        coordinates: [
          [6.2225, -75.6285],
          [6.2265, -75.6215],
          [6.2280, -75.6185],
          [6.2302, -75.6140],
          [6.2318, -75.6085],
          [6.2330, -75.6025]
        ]
      },
      // 3. La Guayabala
      {
        id: 'red-guayabala',
        name: 'Quebrada La Guayabala',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'San José del Manzanillo hacia Rodeo Alto.',
        coordinates: [
          [6.2075, -75.6220],
          [6.2090, -75.6185],
          [6.2105, -75.6150],
          [6.2120, -75.6120],
          [6.2135, -75.6085]
        ]
      },
      // 4. Buenavista
      {
        id: 'red-buenavista',
        name: 'Quebrada Buenavista (Padre Amaya)',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 5,
        description: 'Drena macizo norte de Padre Amaya.',
        coordinates: [
          [6.2435, -75.6225],
          [6.2415, -75.6195],
          [6.2395, -75.6165],
          [6.2375, -75.6135],
          [6.2355, -75.6100]
        ]
      },
      // 5. Las Cañadas
      {
        id: 'red-canada',
        name: 'Quebrada Las Cañadas (La Esperanza)',
        riskLevel: 'bajo',
        color: '#10b981',
        strokeWidth: 4,
        description: 'La Esperanza y confluencia en San Pablo.',
        coordinates: [
          [6.2255, -75.6240],
          [6.2240, -75.6210],
          [6.2230, -75.6180],
          [6.2225, -75.6150],
          [6.2235, -75.6110]
        ]
      }
    ],
    bufferZone: [
      [6.2088, -75.6325],
      [6.2138, -75.6270],
      [6.2188, -75.6210],
      [6.2215, -75.6162],
      [6.2248, -75.6088],
      [6.2268, -75.6028],
      // Retorno
      [6.2262, -75.6022],
      [6.2242, -75.6082],
      [6.2209, -75.6154],
      [6.2182, -75.6200],
      [6.2132, -75.6260],
      [6.2082, -75.6315]
    ],
    sensors: [
      {
        id: 'siata-red-1',
        code: 'SIATA-H308',
        name: 'Estación SIATA #308 (Puente San Pablo)',
        lat: 6.2238,
        lng: -75.6090,
        elevation: 1625,
        levelMeters: 0.68,
        capacityPercentage: 27,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Radar SIATA',
        sectorName: 'San Pablo'
      },
      {
        id: 'siata-red-2',
        code: 'SIATA-H405',
        name: 'Estación SIATA #405 (Aguas Frías)',
        lat: 6.2272,
        lng: -75.6185,
        elevation: 1780,
        levelMeters: 0.62,
        capacityPercentage: 26,
        status: 'seguro',
        trend: 'Estable',
        equipment: 'Sensor Ultrasónico SIATA',
        sectorName: 'Aguas Frías'
      }
    ],
    evacuationPoints: [
      {
        id: 'evac-red-coliseo',
        name: 'Punto Seguro Central: Coliseo Parroquial Altavista',
        lat: 6.2215,
        lng: -75.6165,
        capacity: 650,
        address: 'Carrera 84 #18-35 (Frente al Parque Principal Altavista)',
        safeRoute: 'Evacuación directa a la plaza central.',
        contact: 'Línea 123 Medellín'
      },
      {
        id: 'evac-red-aguasfrias',
        name: 'Punto Seguro Norte: Placa Polideportiva Aguas Frías',
        lat: 6.2295,
        lng: -75.6180,
        capacity: 450,
        address: 'Calle 31A en cota alta de Aguas Frías',
        safeRoute: 'Subir por vía asfaltada.',
        contact: 'Bomberos Medellín'
      },
      {
        id: 'evac-red-manzanillo',
        name: 'Punto Seguro Sur: Cancha Manzanillo',
        lat: 6.2115,
        lng: -75.6140,
        capacity: 400,
        address: 'Vereda San José del Manzanillo',
        safeRoute: 'Evacuar hacia la placa polideportiva.',
        contact: 'Línea 123 Medellín'
      }
    ],
    landmarks: [
      {
        id: 'lm-red-casa-gobierno',
        name: 'Casa de Gobierno Comuna 70 Altavista',
        type: 'comunidad',
        lat: 6.2210,
        lng: -75.6160,
        description: 'Sede administrativa principal y centro de mando de emergencias.'
      }
    ]
  }
};
