export interface QuebradaSensor {
  id: string;
  name: string;
  code: string;
  elevation: number; // msnm
  x: number; // coordinate in SVG viewBox (0-900)
  y: number; // coordinate in SVG viewBox (0-600)
  status: 'normal' | 'advertencia' | 'critico';
  level: number; // m
  maxLevel: number; // m
  battery: number; // %
  trend: string;
  googleMapsQuery?: string;
}

export interface QuebradaEvacuationPoint {
  name: string;
  capacity: number;
  x: number;
  y: number;
  address: string;
  contact: string;
  googleMapsQuery?: string;
}

export interface QuebradaLandmark {
  text: string;
  x: number;
  y: number;
  color?: string;
  fontSize?: number;
  bold?: boolean;
  googleMapsQuery?: string;
  category?: 'salud' | 'comercio' | 'universidad' | 'residencial' | 'via' | 'nacimiento' | 'sector' | 'puente' | 'mirador';
  description?: string;
}

export function getPointGoogleMapsUrl(query: string, satellite: boolean = false): string {
  const clean = query.replace(/\(.*?\)/g, '').replace(/[★·]/g, '').trim();
  const full = clean.toLowerCase().includes('medellín') || clean.toLowerCase().includes('altavista')
    ? clean
    : `${clean}, Altavista, Medellín, Colombia`;
  if (satellite) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}&t=k`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
}

export function getPointGoogleMapsDirectionsUrl(destination: string): string {
  const clean = destination.replace(/\(.*?\)/g, '').replace(/[★·]/g, '').trim();
  const full = clean.toLowerCase().includes('medellín') || clean.toLowerCase().includes('altavista')
    ? clean
    : `${clean}, Altavista, Medellín, Colombia`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(full)}`;
}

export function getPointGoogleMapsEmbedUrl(query: string): string {
  const clean = query.replace(/\(.*?\)/g, '').replace(/[★·]/g, '').trim();
  const full = clean.toLowerCase().includes('medellín') || clean.toLowerCase().includes('altavista')
    ? clean
    : `${clean}, Altavista, Medellín, Colombia`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(full)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
}

export interface QuebradaNetworkBranch {
  id: string;
  name: string;
  veredasPassed: string;
  pathD: string;
  color: string;
  glowColor: string;
  strokeWidth: number;
  labelX: number;
  labelY: number;
  status: 'seguro' | 'alerta_amarilla' | 'alerta_naranja' | 'alerta_roja';
  googleMapsRef: string;
}

export interface QuebradaMapConfig {
  id: string;
  name: string;
  basinTitle: string;
  subtitle: string;
  elevationRange: string;
  basinAreaHa: number;
  riverLengthKm: number;
  averageSlope: string;
  flowVelocity: string;
  ambientTemp: string;
  criticalSector: string;
  currentLevel: number;
  maxThreshold: number;
  marginCm: number;
  fillingPercentage: number;
  trendText: string;
  rainIntensity: string;
  riskBadge: {
    label: string;
    color: string;
    bg: string;
    border: string;
  };
  // Specific SVG paths for this quebrada
  riverPathD: string;
  floodAuraD: string;
  criticalSegmentD?: string;
  mountainContours: { d: string; stroke: string; strokeWidth: number; opacity?: number }[];
  localRoads: { d: string; strokeWidth: number }[];
  landmarks: QuebradaLandmark[];
  sensors: QuebradaSensor[];
  evacuationPoint: QuebradaEvacuationPoint;
  incidentAlert?: {
    text: string;
    x: number;
    y: number;
    severity: 'danger' | 'warning' | 'info';
  };
  specificInstructions: {
    step: number;
    title: string;
    desc: string;
  }[];
  quebradasNetwork?: QuebradaNetworkBranch[];
}

export const QUEBRADAS_MAP_DATA: Record<string, QuebradaMapConfig> = {
  'la-picacha': {
    id: 'la-picacha',
    name: 'La Picacha',
    basinTitle: 'Microcuenca Hidrográfica Quebrada La Picacha (Aguas Frías)',
    subtitle: 'Corredor Completo: Aguas Frías (Droguería) → Calle 31B → Altos del Castillo → Universidad de Medellín → Los Molinos (Calle 30)',
    elevationRange: '2,350 - 1,510 m.s.n.m.',
    basinAreaHa: 1450,
    riverLengthKm: 9.2,
    averageSlope: '28%',
    flowVelocity: '1.8 m/s',
    ambientTemp: '17.8°C',
    criticalSector: 'Droguería Aguas Frías · Altos del Castillo · Universidad de Medellín',
    currentLevel: 2.40,
    maxThreshold: 3.10,
    marginCm: 70,
    fillingPercentage: 77,
    trendText: '+15 cm/h (Alza sostenida)',
    rainIntensity: '42.8 mm/h',
    riskBadge: {
      label: 'ALERTA AMARILLA / PRECAUCIÓN',
      color: 'text-amber-900',
      bg: 'bg-amber-100',
      border: 'border-amber-300'
    },
    // Exact hydrographic course based on Google Maps / user screenshots:
    // Starts high west in Alto de los Santeros, curves down into Vereda Aguas Frías,
    // flows past Droguería Aguas Frías, meanders east by Calle 31B, passes south of
    // ALTOS DEL CASTILLO ETAPA 1 and Calle 32A, runs right by Universidad de Medellín,
    // and exits into the canalized corridor of Calle 30 towards Belén Los Molinos.
    riverPathD: 'M 30 110 C 15 220, 30 330, 80 390 C 120 420, 160 380, 200 395 C 240 410, 270 360, 310 340 C 340 330, 360 345, 385 320 C 410 295, 440 280, 480 270 C 515 260, 540 280, 570 250 C 600 220, 635 240, 680 225 C 725 210, 755 245, 805 220 C 840 200, 870 190, 910 185',
    floodAuraD: 'M 30 110 C 15 220, 30 330, 80 390 C 120 420, 160 380, 200 395 C 240 410, 270 360, 310 340 C 340 330, 360 345, 385 320 C 410 295, 440 280, 480 270 C 515 260, 540 280, 570 250 C 600 220, 635 240, 680 225 C 725 210, 755 245, 805 220 C 840 200, 870 190, 910 185',
    criticalSegmentD: 'M 385 320 C 410 295, 440 280, 480 270 C 515 260, 540 280, 570 250 C 600 220, 635 240, 680 225 C 725 210, 755 245, 805 220',
    mountainContours: [
      { d: 'M 30 60 Q 180 30 340 60 T 700 40', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 20 160 Q 210 120 400 160 T 800 120', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 50 260 Q 240 210 460 250 T 870 210', stroke: '#cbd5e1', strokeWidth: 1 },
      { d: 'M 70 380 Q 270 330 530 370 T 890 340', stroke: '#cbd5e1', strokeWidth: 1 }
    ],
    localRoads: [
      { d: 'M 70 410 L 190 395 L 320 340 L 400 320 L 480 275 L 560 260 L 670 230 L 800 215 L 905 190', strokeWidth: 3.5 }, // Carretera Aguas Frías
      { d: 'M 480 275 L 530 220 L 590 190', strokeWidth: 2.5 }, // Calle 31B
      { d: 'M 670 140 L 760 145 L 850 160', strokeWidth: 2.5 }, // Calle 32A
      { d: 'M 680 235 L 710 320 L 780 340 L 850 330', strokeWidth: 3 }, // Eje Campus Universidad de Medellín
      { d: 'M 790 220 L 850 200 L 910 185', strokeWidth: 4.5 } // Corredor Calle 30 hacia Los Molinos / Metroplús
    ],
    landmarks: [
      {
        text: 'ALTO DE LOS SANTEROS (2,350 m · Nacimiento)',
        x: 40,
        y: 75,
        color: '#064e3b',
        fontSize: 12,
        bold: true,
        googleMapsQuery: 'Alto de los Santeros, Altavista, Medellín',
        category: 'nacimiento',
        description: 'Punto más alto de la cuenca (2,350 msnm) donde nacen los afluentes de montaña de La Picacha'
      },
      {
        text: 'VEREDA AGUAS FRÍAS ALTA',
        x: 80,
        y: 360,
        color: '#065f46',
        fontSize: 11.5,
        bold: true,
        googleMapsQuery: 'Vereda Aguas Frías, Medellín, Antioquia',
        category: 'sector',
        description: 'Sector rural alto a lo largo de la carretera principal de Aguas Frías'
      },
      {
        text: 'DROGUERÍA AGUAS FRÍAS (Ref. Google Maps)',
        x: 335,
        y: 275,
        color: '#dc2626',
        fontSize: 12,
        bold: true,
        googleMapsQuery: 'Droguería Aguas Frías, Medellín, Antioquia',
        category: 'salud',
        description: 'Referente comercial y comunitario central en la Vereda Aguas Frías (pin rojo en Google Maps)'
      },
      {
        text: 'Calle 31B',
        x: 495,
        y: 215,
        color: '#475569',
        fontSize: 11,
        bold: true,
        googleMapsQuery: 'Calle 31B, Aguas Frías, Medellín',
        category: 'via',
        description: 'Corredor vial que comunica el sector alto con la cuenca media de la quebrada'
      },
      {
        text: 'ALTOS DEL CASTILLO ETAPA 1',
        x: 570,
        y: 155,
        color: '#1e293b',
        fontSize: 12.5,
        bold: true,
        googleMapsQuery: 'Altos del Castillo Etapa 1, Belén, Medellín',
        category: 'residencial',
        description: 'Sector residencial y de vivienda en la ladera norte frente al cauce de La Picacha'
      },
      {
        text: 'Calle 32A',
        x: 745,
        y: 130,
        color: '#475569',
        fontSize: 11,
        bold: true,
        googleMapsQuery: 'Calle 32A, Belén, Medellín',
        category: 'via',
        description: 'Vía residencial que desciende en la transición hacia Belén'
      },
      {
        text: 'Universidad de Medellín',
        x: 670,
        y: 320,
        color: '#0369a1',
        fontSize: 13,
        bold: true,
        googleMapsQuery: 'Universidad de Medellín, Carrera 87 #30-65, Medellín',
        category: 'universidad',
        description: 'Campus universitario adyacente a la quebrada, zona segura y plataforma de evacuación'
      },
      {
        text: 'BELÉN LOS ALPES / LOS MOLINOS (Calle 30)',
        x: 730,
        y: 180,
        color: '#1e293b',
        fontSize: 11.5,
        bold: true,
        googleMapsQuery: 'Centro Comercial Los Molinos, Calle 30, Medellín',
        category: 'sector',
        description: 'Tramo canalizado urbano sobre el corredor de la Calle 30 y Metroplús'
      }
    ],
    sensors: [
      {
        id: 'sens-401',
        name: 'Cabecera Aguas Frías Alta',
        code: 'SIATA-#401',
        elevation: 2120,
        x: 130,
        y: 400,
        status: 'normal',
        level: 0.85,
        maxLevel: 2.50,
        battery: 98,
        trend: 'Estable'
      },
      {
        id: 'sens-404',
        name: 'Sensor Droguería Aguas Frías',
        code: 'SIATA-#404',
        elevation: 1860,
        x: 410,
        y: 315,
        status: 'advertencia',
        level: 2.15,
        maxLevel: 3.00,
        battery: 96,
        trend: '+12 cm/h'
      },
      {
        id: 'sens-405',
        name: 'Sensor Altos del Castillo / Calle 31B',
        code: 'SIATA-#405',
        elevation: 1720,
        x: 580,
        y: 255,
        status: 'critico',
        level: 2.40,
        maxLevel: 3.10,
        battery: 94,
        trend: '+15 cm/h (Alza sostenida)'
      },
      {
        id: 'sens-406',
        name: 'Sensor Universidad de Medellín',
        code: 'SIATA-#406',
        elevation: 1610,
        x: 720,
        y: 235,
        status: 'advertencia',
        level: 2.05,
        maxLevel: 3.20,
        battery: 93,
        trend: '+9 cm/h'
      },
      {
        id: 'sens-403',
        name: 'Belén Los Molinos (Calle 30)',
        code: 'SIATA-#403',
        elevation: 1540,
        x: 855,
        y: 195,
        status: 'normal',
        level: 1.65,
        maxLevel: 3.30,
        battery: 91,
        trend: 'Flujo canalizado'
      }
    ],
    evacuationPoint: {
      name: 'Puntos Seguros: Campus Universidad de Medellín (Coliseo / Canchas) y Placa Aguas Frías',
      capacity: 1200,
      x: 740,
      y: 350,
      address: 'Carrera 87 #30-65 (Campus UdeM) y Sector Central Aguas Frías',
      contact: 'Comité de Emergencias: 300 240 7070 / UdeM Seguridad: (604) 340 5555'
    },
    incidentAlert: {
      text: 'Monitoreo en Vivo: Tramo Droguería Aguas Frías → Altos del Castillo → Universidad de Medellín → Los Molinos',
      x: 440,
      y: 210,
      severity: 'danger'
    },
    specificInstructions: [
      {
        step: 1,
        title: 'Monitoree el cauce superior en Vereda Aguas Frías y Droguería',
        desc: 'El flujo desciende paralelo a la carretera principal pasando por la Droguería Aguas Frías. Alerte si observa ramas o turbiedad repentina.'
      },
      {
        step: 2,
        title: 'Vigilancia en sector Calle 31B y Altos del Castillo Etapa 1',
        desc: 'En la curva frente a Altos del Castillo la velocidad del agua aumenta por el desnivel del cañón. Evite transitar por la orilla del talud.'
      },
      {
        step: 3,
        title: 'Punto seguro en Universidad de Medellín y corredor Calle 30',
        desc: 'Ante riesgo de desbordamiento, diríjase a las zonas altas del campus de la Universidad de Medellín o a la plataforma segura de la Calle 30 fuera del canal.'
      }
    ]
  },

  'altavista': {
    id: 'altavista',
    name: 'Altavista',
    basinTitle: 'Eje Hidrográfico Principal Quebrada Altavista',
    subtitle: 'Tramo Exclusivo: Alto El Romeral → Vereda Aguas Frías → Morro Plan → Central',
    elevationRange: '2,550 - 1,530 m.s.n.m.',
    basinAreaHa: 2820,
    riverLengthKm: 14.8,
    averageSlope: '21%',
    flowVelocity: '0.9 m/s',
    ambientTemp: '16.4°C',
    criticalSector: 'Sector Morro Plan · Vereda Aguas Frías',
    currentLevel: 1.84,
    maxThreshold: 2.50,
    marginCm: 66,
    fillingPercentage: 35,
    trendText: 'Estable (Flujo constante)',
    rainIntensity: '12.4 mm/h',
    riskBadge: {
      label: 'NIVEL VERDE / CAUDAL SEGURO',
      color: 'text-emerald-900',
      bg: 'bg-emerald-100',
      border: 'border-emerald-300'
    },
    // Distinct path for Quebrada Altavista: North-South central corridor descending from Alto Romeral (480, 60), bending through Aguas Frias (420, 240), Morro Plan (370, 390), La Palma (450, 520)
    riverPathD: 'M 490 60 Q 460 150 430 230 T 380 340 T 390 440 T 470 540',
    floodAuraD: 'M 490 60 Q 460 150 430 230 T 380 340 T 390 440 T 470 540',
    criticalSegmentD: 'M 430 230 Q 400 290 380 340',
    mountainContours: [
      { d: 'M 150 80 Q 400 50 650 90 T 850 70', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 120 180 Q 380 140 680 170 T 880 150', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 140 290 Q 360 270 690 310', stroke: '#cbd5e1', strokeWidth: 1 },
      { d: 'M 160 410 Q 370 390 720 420', stroke: '#cbd5e1', strokeWidth: 1 }
    ],
    localRoads: [
      { d: 'M 440 50 L 410 240 L 360 380 L 420 560', strokeWidth: 3.5 }, // Vía Principal a Manzanillo / Altavista
      { d: 'M 180 340 L 370 360 L 680 340', strokeWidth: 2 }, // Vía transversal Aguas Frías
      { d: 'M 220 480 L 440 500 L 750 490', strokeWidth: 2 } // Vía La Palma
    ],
    landmarks: [
      { text: 'ALTO EL ROMERAL (2,550 m)', x: 450, y: 45, color: '#064e3b', fontSize: 13, bold: true },
      { text: 'Vereda San José del Manzanillo', x: 530, y: 130, color: '#334155', fontSize: 12 },
      { text: 'Reserva Forestal Manzanillo', x: 210, y: 150, color: '#047857', fontSize: 12 },
      { text: 'Vereda Aguas Frías', x: 260, y: 260, color: '#334155', fontSize: 13, bold: true },
      { text: 'SECTOR MORRO PLAN (Estación Radar)', x: 430, y: 370, color: '#0f766e', fontSize: 13, bold: true },
      { text: 'Finca La Esperanza', x: 240, y: 430, color: '#475569', fontSize: 12 },
      { text: 'Corregimiento Altavista Central', x: 500, y: 530, color: '#1e293b', fontSize: 13, bold: true }
    ],
    sensors: [
      {
        id: 'sens-307',
        name: 'Nacimiento El Romeral',
        code: 'SIATA-#307',
        elevation: 2420,
        x: 480,
        y: 110,
        status: 'normal',
        level: 0.62,
        maxLevel: 2.20,
        battery: 99,
        trend: 'Estable'
      },
      {
        id: 'sens-308',
        name: 'Estación Radar Morro Plan',
        code: 'SIATA-#308',
        elevation: 1820,
        x: 380,
        y: 350,
        status: 'normal',
        level: 1.84,
        maxLevel: 2.50,
        battery: 98,
        trend: 'Estable (Margen: 66 cm)'
      },
      {
        id: 'sens-309',
        name: 'Puente Peatonal Manzanillo',
        code: 'SIATA-#309',
        elevation: 1680,
        x: 450,
        y: 490,
        status: 'normal',
        level: 1.15,
        maxLevel: 2.40,
        battery: 96,
        trend: 'Descenso leve'
      }
    ],
    evacuationPoint: {
      name: 'Punto de Encuentro: Coliseo Parroquial Altavista',
      capacity: 600,
      x: 620,
      y: 450,
      address: 'Carrera 84 #18-35 (Frente al Parque Principal)',
      contact: 'Bomberos Medellín: 119 / Central Comunitaria'
    },
    incidentAlert: {
      text: 'Sensor Radar: Cauce normal con libre escorrentía',
      x: 400,
      y: 290,
      severity: 'info'
    },
    specificInstructions: [
      {
        step: 1,
        title: 'Verifique los niveles en el puente de Aguas Frías',
        desc: 'El caudal corre despejado con margen de 66 cm bajo el umbral de alerta.'
      },
      {
        step: 2,
        title: 'Mantenga libres los canales de desagüe veredal',
        desc: 'Evite arrojar residuos vegetales o bolsas de café a las zanjas de coronación.'
      },
      {
        step: 3,
        title: 'Punto de reunión en caso de incremento súbito',
        desc: 'Diríjase por la Vía Principal hacia el Coliseo Parroquial de Altavista Central.'
      }
    ]
  },

  'buenavista': {
    id: 'buenavista',
    name: 'Buenavista',
    basinTitle: 'Microcuenca Torrencial Quebrada Buenavista',
    subtitle: 'Tramo Exclusivo: Cerros Padre Amaya → Canteras → Ladrilleras → Box-Culvert',
    elevationRange: '2,620 - 1,680 m.s.n.m.',
    basinAreaHa: 890,
    riverLengthKm: 6.4,
    averageSlope: '38%',
    flowVelocity: '2.4 m/s',
    ambientTemp: '15.9°C',
    criticalSector: 'Sector Ladrilleras · Box-Culvert Vía El Morro',
    currentLevel: 2.15,
    maxThreshold: 2.80,
    marginCm: 65,
    fillingPercentage: 72,
    trendText: '+22 cm/h (Alza rápida torrencial)',
    rainIntensity: '54.2 mm/h',
    riskBadge: {
      label: 'ALERTA NARANJA / RIESGO DE SEDIMENTOS',
      color: 'text-orange-950',
      bg: 'bg-orange-100',
      border: 'border-orange-400'
    },
    // Distinct path for Buenavista: steep jagged zigzag chute descending from north-west cliffs (160, 60), through quarries (320, 190), Ladrillera San Judas (500, 310), to Box-Culvert (720, 480)
    riverPathD: 'M 160 60 L 260 140 L 350 200 L 460 270 L 580 370 L 730 470',
    floodAuraD: 'M 160 60 L 260 140 L 350 200 L 460 270 L 580 370 L 730 470',
    criticalSegmentD: 'M 350 200 L 460 270 L 580 370',
    mountainContours: [
      { d: 'M 60 50 L 300 40 L 600 70', stroke: '#78716c', strokeWidth: 1.5 },
      { d: 'M 40 120 L 350 110 L 720 130', stroke: '#78716c', strokeWidth: 1.5 },
      { d: 'M 70 230 L 420 220 L 780 240', stroke: '#a8a29e', strokeWidth: 1.2 },
      { d: 'M 90 350 L 520 330 L 840 360', stroke: '#a8a29e', strokeWidth: 1.2 }
    ],
    localRoads: [
      { d: 'M 120 240 L 390 270 L 660 300 L 860 330', strokeWidth: 3 }, // Vía El Morro km 2.5
      { d: 'M 420 110 L 490 320 L 560 540', strokeWidth: 2.5 }, // Acceso Canteras Ladrillera
      { d: 'M 220 390 L 580 410 L 780 430', strokeWidth: 2 } // Vía Box-Culvert
    ],
    landmarks: [
      { text: 'CERROS DEL PADRE AMAYA (2,620 m)', x: 130, y: 45, color: '#451a03', fontSize: 13, bold: true },
      { text: 'Canteras Altas La Aurora', x: 180, y: 160, color: '#78350f', fontSize: 12 },
      { text: 'SECTOR LADRILLERAS SAN JUDAS', x: 440, y: 240, color: '#9a3412', fontSize: 13, bold: true },
      { text: 'Cruce Crítico Vía El Morro km 2.5', x: 520, y: 350, color: '#991b1b', fontSize: 13, bold: true },
      { text: 'Box-Culvert Central de Mitigación', x: 620, y: 450, color: '#0369a1', fontSize: 13, bold: true },
      { text: 'Escuela Rural Buenavista', x: 260, y: 460, color: '#065f46', fontSize: 12, bold: true }
    ],
    sensors: [
      {
        id: 'sens-511',
        name: 'Cabecera Padre Amaya',
        code: 'SIATA-#511',
        elevation: 2510,
        x: 240,
        y: 125,
        status: 'advertencia',
        level: 1.20,
        maxLevel: 2.30,
        battery: 92,
        trend: 'Lluvia intensa (54.2 mm/h)'
      },
      {
        id: 'sens-512',
        name: 'Sector Ladrilleras',
        code: 'SIATA-#512',
        elevation: 1980,
        x: 480,
        y: 285,
        status: 'critico',
        level: 2.15,
        maxLevel: 2.80,
        battery: 89,
        trend: '+22 cm/h (Alza sostenida)'
      },
      {
        id: 'sens-513',
        name: 'Disipador Box-Culvert',
        code: 'SIATA-#513',
        elevation: 1720,
        x: 680,
        y: 435,
        status: 'advertencia',
        level: 1.88,
        maxLevel: 2.70,
        battery: 95,
        trend: 'Flujo torrencial con lodo'
      }
    ],
    evacuationPoint: {
      name: 'Punto de Encuentro: Escuela Rural Buenavista',
      capacity: 300,
      x: 340,
      y: 450,
      address: 'Vereda Buenavista Sector Escolar (Zona Alta Segura)',
      contact: 'Defensa Civil / Bomberos: 119'
    },
    incidentAlert: {
      text: 'Alerta Roja: Arrastre masivo de lodo y piedras en canteras',
      x: 420,
      y: 190,
      severity: 'danger'
    },
    specificInstructions: [
      {
        step: 1,
        title: 'Atención a ruidos sordos de piedras en la ladera',
        desc: 'La fuerte inclinación (38°) arrastra material pétreo. Evacúe si observa cambio abrupto de color a lodo espeso.'
      },
      {
        step: 2,
        title: 'Evite pasar bajo el Box-Culvert de Vía El Morro',
        desc: 'El colector presenta acumulación de sedimentos. Use el paso alterno por la parte alta.'
      },
      {
        step: 3,
        title: 'Refugio seguro en Escuela Rural Buenavista',
        desc: 'Ubicada sobre roca firme fuera de la franja de deslizamiento.'
      }
    ]
  },

  'la-canada': {
    id: 'la-canada',
    name: 'Las Cañadas (La Esperanza)',
    basinTitle: 'Microcuenca Hidrográfica Quebrada Las Cañadas · Vereda La Esperanza',
    subtitle: 'Tramo Georreferenciado Medellín: Vereda La Esperanza → Sector El Chispero → Puente La Esperanza → Confluencia Q. Altavista (San Pablo)',
    elevationRange: '2,180 - 1,640 m.s.n.m.',
    basinAreaHa: 685,
    riverLengthKm: 4.8,
    averageSlope: '24%',
    flowVelocity: '1.2 m/s',
    ambientTemp: '17.5°C',
    criticalSector: 'Puente Peatonal La Esperanza (Calle 18A) · Sector El Chispero',
    currentLevel: 1.10,
    maxThreshold: 2.40,
    marginCm: 130,
    fillingPercentage: 45,
    trendText: 'Estable (-4 cm/h con flujo libre)',
    rainIntensity: '12.4 mm/h',
    riskBadge: {
      label: 'NIVEL VERDE / CAUCE NORMAL EN LA ESPERANZA',
      color: 'text-emerald-900',
      bg: 'bg-emerald-100',
      border: 'border-emerald-300'
    },
    // Realistic S-curve descending from high La Esperanza (140, 80) through El Chispero (310, 200), crossing Puente Calle 18A (430, 280), through San Pablo (690, 440), and meeting Q. Altavista (780, 490)
    riverPathD: 'M 140 80 Q 230 140 310 200 T 430 280 T 560 360 T 690 440 T 780 490',
    floodAuraD: 'M 140 80 Q 230 140 310 200 T 430 280 T 560 360 T 690 440 T 780 490',
    criticalSegmentD: 'M 310 200 Q 370 240 430 280 T 500 320',
    mountainContours: [
      { d: 'M 60 70 Q 220 40 420 80 T 780 60', stroke: '#86efac', strokeWidth: 1.5, opacity: 0.7 },
      { d: 'M 40 150 Q 250 120 480 160 T 820 140', stroke: '#86efac', strokeWidth: 1.5, opacity: 0.7 },
      { d: 'M 50 250 Q 290 220 540 260 T 860 240', stroke: '#bbf7d0', strokeWidth: 1.2, opacity: 0.7 },
      { d: 'M 80 370 Q 330 330 610 380 T 890 350', stroke: '#bbf7d0', strokeWidth: 1.2, opacity: 0.7 }
    ],
    localRoads: [
      { d: 'M 100 240 L 320 270 L 550 290 L 820 310', strokeWidth: 3 }, // Calle 18A Vía Principal La Esperanza
      { d: 'M 280 80 L 330 270 L 400 520', strokeWidth: 2.2 }, // Camino a Sector El Chispero
      { d: 'M 520 190 L 590 380 L 680 560', strokeWidth: 2.5 } // Conexión a Vereda San Pablo / Calle 18
    ],
    landmarks: [
      { text: 'ALTO VEREDA LA ESPERANZA (2,180 m)', x: 100, y: 55, color: '#064e3b', fontSize: 13, bold: true },
      { text: 'Sector El Chispero (Zona de Ladera)', x: 200, y: 155, color: '#166534', fontSize: 12 },
      { text: 'Vía Principal Calle 18A (La Esperanza)', x: 270, y: 235, color: '#475569', fontSize: 11.5 },
      { text: 'PUENTE LA ESPERANZA (Cruce Crítico)', x: 390, y: 275, color: '#991b1b', fontSize: 13, bold: true },
      { text: 'Placa Polideportiva La Esperanza', x: 210, y: 395, color: '#065f46', fontSize: 12, bold: true },
      { text: 'Vereda San Pablo (Margen Derecha)', x: 570, y: 380, color: '#334155', fontSize: 12, bold: true },
      { text: 'I.E. Altavista / Débora Arango', x: 690, y: 410, color: '#1e293b', fontSize: 12 },
      { text: 'CONFLUENCIA CON QUEBRADA ALTAVISTA', x: 620, y: 520, color: '#0284c7', fontSize: 12.5, bold: true }
    ],
    sensors: [
      {
        id: 'sens-214',
        name: 'Telemetría La Esperanza Alta',
        code: 'SIATA-#214',
        elevation: 2080,
        x: 270,
        y: 170,
        status: 'normal',
        level: 0.55,
        maxLevel: 2.10,
        battery: 100,
        trend: 'Estable'
      },
      {
        id: 'sens-215',
        name: 'Sensor Puente La Esperanza',
        code: 'SIATA-#215',
        elevation: 1680,
        x: 480,
        y: 310,
        status: 'normal',
        level: 1.10,
        maxLevel: 2.40,
        battery: 99,
        trend: 'Flujo despejado (-4 cm/h)'
      }
    ],
    evacuationPoint: {
      name: 'Punto de Encuentro: Placa Polideportiva Vereda La Esperanza',
      capacity: 400,
      x: 320,
      y: 410,
      address: 'Calle 18A #88-15 (Sector Alto Seguro La Esperanza)',
      contact: 'Línea Comunitaria Altavista: 300 240 7070'
    },
    incidentAlert: {
      text: 'Sector La Esperanza: Cauce libre sin represamientos en Puente Calle 18A',
      x: 380,
      y: 210,
      severity: 'info'
    },
    specificInstructions: [
      {
        step: 1,
        title: 'Verifique el paso en el Puente de la Calle 18A',
        desc: 'El cauce en el puente peatonal La Esperanza fluye sin obstrucciones, con un margen de seguridad de 130 cm respecto a la calzada.'
      },
      {
        step: 2,
        title: 'Monitoreo en ladera de El Chispero',
        desc: 'Durante lluvias torrenciales en la cabecera alta de La Esperanza, esté alerta a ruidos de rocas o cambios súbitos en la turbiedad del agua.'
      },
      {
        step: 3,
        title: 'Punto de encuentro seguro en la Placa Polideportiva',
        desc: 'Ubicada sobre cota elevada en la Calle 18A, fuera de la cota de inundación de la Quebrada Las Cañadas y de la Quebrada Altavista.'
      }
    ]
  },

  'la-guayabala': {
    id: 'la-guayabala',
    name: 'La Guayabala',
    basinTitle: 'Microcuenca Hidrográfica Quebrada La Guayabala',
    subtitle: 'Zona Sur: Cuchilla El Barcino → Vereda San José del Manzanillo → Vereda El Jardín → Rodeo Alto',
    elevationRange: '2,300 - 1,515 m.s.n.m.',
    basinAreaHa: 890,
    riverLengthKm: 6.8,
    averageSlope: '22%',
    flowVelocity: '1.1 m/s',
    ambientTemp: '19.1°C',
    criticalSector: 'Vereda San José del Manzanillo · Sector Las Camelias',
    currentLevel: 1.35,
    maxThreshold: 2.60,
    marginCm: 125,
    fillingPercentage: 52,
    trendText: 'Estable (-2 cm/h)',
    rainIntensity: '18.2 mm/h',
    riskBadge: {
      label: 'NIVEL VERDE / CAUCE NORMAL',
      color: 'text-emerald-900',
      bg: 'bg-emerald-100',
      border: 'border-emerald-300'
    },
    riverPathD: 'M 90 120 Q 220 190 350 260 T 520 370 T 710 460 T 870 510',
    floodAuraD: 'M 90 120 Q 220 190 350 260 T 520 370 T 710 460 T 870 510',
    criticalSegmentD: 'M 350 260 T 520 370',
    mountainContours: [
      { d: 'M 30 70 Q 230 40 470 80 T 860 60', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 20 170 Q 260 130 520 180 T 880 150', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 40 310 Q 300 270 590 320 T 870 290', stroke: '#cbd5e1', strokeWidth: 1 },
      { d: 'M 50 450 Q 340 410 630 460 T 890 430', stroke: '#e2e8f0', strokeWidth: 1 }
    ],
    localRoads: [
      { d: 'M 80 140 L 340 280 L 670 420 L 880 480', strokeWidth: 3 }, // Vía a San José del Manzanillo
      { d: 'M 290 300 L 480 460', strokeWidth: 2 } // Vía El Jardín
    ],
    landmarks: [
      { text: 'CUCHILLA EL BARCINO (2,300 m · Nacimiento)', x: 70, y: 100, color: '#1e293b', fontSize: 11.5, bold: true },
      { text: 'VEREDA SAN JOSÉ DEL MANZANILLO', x: 280, y: 225, color: '#065f46', fontSize: 12, bold: true },
      { text: 'VEREDA EL JARDÍN', x: 470, y: 335, color: '#065f46', fontSize: 12, bold: true },
      { text: 'SECTOR LAS CAMELIAS', x: 640, y: 425, color: '#0f172a', fontSize: 11.5, bold: true },
      { text: 'RETIRO HIDRÁULICO RODEO ALTO', x: 720, y: 490, color: '#0369a1', fontSize: 12, bold: true }
    ],
    sensors: [
      {
        id: 'sens-618',
        name: 'Sensor San José del Manzanillo',
        code: 'SIATA-#618',
        elevation: 1890,
        x: 350,
        y: 260,
        status: 'normal',
        level: 1.35,
        maxLevel: 2.60,
        battery: 97,
        trend: 'Estable'
      }
    ],
    evacuationPoint: {
      name: 'Punto de Encuentro: Placa Polideportiva San José del Manzanillo',
      capacity: 450,
      x: 390,
      y: 290,
      address: 'Vereda San José del Manzanillo (Cota Alta)',
      contact: 'Comité Local de Emergencias: 312 400 7080'
    },
    specificInstructions: [
      {
        step: 1,
        title: 'Vigilancia en Sector Las Camelias',
        desc: 'Inspeccione que el lecho no presente empalizadas arrastradas desde la Cuchilla El Barcino.'
      },
      {
        step: 2,
        title: 'Mantenimiento de cunetas veredales',
        desc: 'Mantenga despejadas las alcantarillas de la vía Manzanillo para evitar saturación del talud.'
      },
      {
        step: 3,
        title: 'Ruta hacia la Placa Polideportiva',
        desc: 'Evacue hacia el sector central de San José del Manzanillo, punto fuera de la franja de inundación.'
      }
    ]
  },

  'el-pelon': {
    id: 'el-pelon',
    name: 'El Pelón',
    basinTitle: 'Microcuenca Hidrográfica Quebrada El Pelón',
    subtitle: 'Zona Rural Sur: Sector San José → Vereda San José del Manzanillo',
    elevationRange: '2,120 - 1,730 m.s.n.m.',
    basinAreaHa: 210,
    riverLengthKm: 2.6,
    averageSlope: '38%',
    flowVelocity: '0.8 m/s',
    ambientTemp: '18.5°C',
    criticalSector: 'Sector San José Alto · Taludes en Camino Veredal',
    currentLevel: 0.90,
    maxThreshold: 2.20,
    marginCm: 130,
    fillingPercentage: 41,
    trendText: 'Estable',
    rainIntensity: '12.0 mm/h',
    riskBadge: {
      label: 'NIVEL VERDE / CAUCE NORMAL',
      color: 'text-emerald-900',
      bg: 'bg-emerald-100',
      border: 'border-emerald-300'
    },
    riverPathD: 'M 160 90 Q 280 180 430 280 T 630 410 T 800 520',
    floodAuraD: 'M 160 90 Q 280 180 430 280 T 630 410 T 800 520',
    criticalSegmentD: 'M 280 180 T 430 280',
    mountainContours: [
      { d: 'M 50 60 Q 260 30 510 70 T 870 50', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 40 180 Q 290 140 560 190 T 880 160', stroke: '#cbd5e1', strokeWidth: 1 },
      { d: 'M 60 350 Q 320 310 610 360 T 890 330', stroke: '#cbd5e1', strokeWidth: 1 }
    ],
    localRoads: [
      { d: 'M 140 110 L 400 290 L 760 480', strokeWidth: 2.5 }
    ],
    landmarks: [
      { text: 'SECTOR SAN JOSÉ ALTO (2,120 m)', x: 120, y: 70, color: '#1e293b', fontSize: 11.5, bold: true },
      { text: 'CAMINO VEREDAL MANZANILLO', x: 340, y: 250, color: '#065f46', fontSize: 12, bold: true },
      { text: 'CANALIZACIÓN MI RÍO MIS QUEBRADAS', x: 550, y: 380, color: '#0f172a', fontSize: 11.5, bold: true },
      { text: 'CONFLUENCIA Q. LA GUAYABALA', x: 670, y: 495, color: '#0369a1', fontSize: 12, bold: true }
    ],
    sensors: [
      {
        id: 'sens-621',
        name: 'Sensor Acústico El Pelón',
        code: 'SIATA-#621',
        elevation: 1910,
        x: 430,
        y: 280,
        status: 'normal',
        level: 0.90,
        maxLevel: 2.20,
        battery: 95,
        trend: 'Estable'
      }
    ],
    evacuationPoint: {
      name: 'Salón Comunal Vereda Manzanillo',
      capacity: 250,
      x: 470,
      y: 310,
      address: 'Vereda San José del Manzanillo (Cerca a capilla)',
      contact: 'Comité Comunitario: 314 200 9090'
    },
    specificInstructions: [
      {
        step: 1,
        title: 'Revisión en el camino veredal',
        desc: 'El cauce corre por pendientes pronunciadas; evite transitar por la orilla del talud en lluvias.'
      },
      {
        step: 2,
        title: 'Verificación del paso hacia La Guayabala',
        desc: 'Monitoree el punto de confluencia con La Guayabala por posibles retrocesos hidráulicos.'
      }
    ]
  },

  'buga-barcino': {
    id: 'buga-barcino',
    name: 'Buga y El Barcino',
    basinTitle: 'Cabeceras Altas: Quebradas Buga y El Barcino',
    subtitle: 'Zona de Alta Montaña: Cuchilla El Barcino → Vereda Buga → Patio Bonito',
    elevationRange: '2,450 - 1,820 m.s.n.m.',
    basinAreaHa: 620,
    riverLengthKm: 5.4,
    averageSlope: '48%',
    flowVelocity: '1.3 m/s',
    ambientTemp: '15.5°C',
    criticalSector: 'Cañón Alto de Buga · Vertientes Escarpadas',
    currentLevel: 0.85,
    maxThreshold: 2.40,
    marginCm: 155,
    fillingPercentage: 35,
    trendText: 'Flujo laminar montano',
    rainIntensity: '15.0 mm/h',
    riskBadge: {
      label: 'CABECERA DE PROTECCIÓN / CAUCE LIMPIO',
      color: 'text-emerald-900',
      bg: 'bg-emerald-100',
      border: 'border-emerald-300'
    },
    riverPathD: 'M 110 70 Q 200 160 330 240 T 510 330 T 730 430 T 880 480',
    floodAuraD: 'M 110 70 Q 200 160 330 240 T 510 330 T 730 430 T 880 480',
    criticalSegmentD: 'M 330 240 T 510 330',
    mountainContours: [
      { d: 'M 30 50 Q 220 20 460 60 T 870 40', stroke: '#94a3b8', strokeWidth: 1.5 },
      { d: 'M 20 150 Q 250 110 520 160 T 880 130', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 40 280 Q 290 240 580 290 T 870 260', stroke: '#cbd5e1', strokeWidth: 1 },
      { d: 'M 50 420 Q 330 380 640 430 T 890 400', stroke: '#e2e8f0', strokeWidth: 1 }
    ],
    localRoads: [
      { d: 'M 90 90 L 320 260 L 680 440 L 880 490', strokeWidth: 2.5 }
    ],
    landmarks: [
      { text: 'CUCHILLA EL BARCINO (2,450 m)', x: 90, y: 50, color: '#1e293b', fontSize: 12, bold: true },
      { text: 'RESERVA NATURAL VEREDA BUGA', x: 260, y: 210, color: '#065f46', fontSize: 12, bold: true },
      { text: 'SECTOR PATIO BONITO (Confluencia Formadora Q. Altavista)', x: 440, y: 310, color: '#0369a1', fontSize: 12, bold: true }
    ],
    sensors: [
      {
        id: 'sens-301',
        name: 'Pluviómetro Forestal Buga',
        code: 'SIATA-#301',
        elevation: 2190,
        x: 330,
        y: 240,
        status: 'normal',
        level: 0.85,
        maxLevel: 2.40,
        battery: 99,
        trend: 'Estable'
      }
    ],
    evacuationPoint: {
      name: 'Escuela Rural Vereda Buga',
      capacity: 300,
      x: 370,
      y: 270,
      address: 'Vereda Buga (Planta Central)',
      contact: 'Línea de Enlace Buga: 311 300 8080'
    },
    specificInstructions: [
      {
        step: 1,
        title: 'Protección de franja de reserva forestal',
        desc: 'Las cabeceras conservan cobertura de niebla y rastrojos altos; no arrojar desechos ni intervenir el retiro.'
      },
      {
        step: 2,
        title: 'Monitoreo de lluvias orográficas',
        desc: 'Las lluvias en la cuchilla alimentan el eje principal de la Quebrada Altavista en Patio Bonito.'
      }
    ]
  },

  'ana-diaz': {
    id: 'ana-diaz',
    name: 'Ana Díaz',
    basinTitle: 'Microcuenca Hidrográfica Quebrada Ana Díaz',
    subtitle: 'Límite Septentrional: Flanco Norte Vereda El Corazón → Límite Comuna 13',
    elevationRange: '2,250 - 1,520 m.s.n.m.',
    basinAreaHa: 510,
    riverLengthKm: 5.8,
    averageSlope: '29%',
    flowVelocity: '1.6 m/s',
    ambientTemp: '18.2°C',
    criticalSector: 'Sector El Corazón Alto · Cancha El Salado',
    currentLevel: 1.95,
    maxThreshold: 2.70,
    marginCm: 75,
    fillingPercentage: 72,
    trendText: '+10 cm/h (Alerta temprana)',
    rainIntensity: '38.5 mm/h',
    riskBadge: {
      label: 'ALERTA AMARILLA / PRECAUCIÓN',
      color: 'text-amber-900',
      bg: 'bg-amber-100',
      border: 'border-amber-300'
    },
    riverPathD: 'M 90 90 Q 230 140 370 200 T 560 280 T 730 380 T 870 440',
    floodAuraD: 'M 90 90 Q 230 140 370 200 T 560 280 T 730 380 T 870 440',
    criticalSegmentD: 'M 370 200 T 560 280',
    mountainContours: [
      { d: 'M 40 50 Q 240 20 480 60 T 870 40', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 30 150 Q 270 110 540 160 T 880 130', stroke: '#94a3b8', strokeWidth: 1.2 },
      { d: 'M 50 290 Q 310 250 610 300 T 870 270', stroke: '#cbd5e1', strokeWidth: 1 }
    ],
    localRoads: [
      { d: 'M 80 110 L 350 210 L 690 390 L 880 450', strokeWidth: 3 }
    ],
    landmarks: [
      { text: 'FLANCO NORTE VEREDA EL CORAZÓN', x: 80, y: 70, color: '#1e293b', fontSize: 11.5, bold: true },
      { text: 'CANCHA EL SALADO', x: 330, y: 175, color: '#065f46', fontSize: 12, bold: true },
      { text: 'SECTOR BETANIA / LÍMITE COMUNA 13', x: 530, y: 255, color: '#0f172a', fontSize: 12, bold: true },
      { text: 'COLECTOR CANALIZADO HACIA LA AMÉRICA', x: 670, y: 360, color: '#0369a1', fontSize: 12, bold: true }
    ],
    sensors: [
      {
        id: 'sens-702',
        name: 'Sensor Radar Ana Díaz',
        code: 'SIATA-#702',
        elevation: 1980,
        x: 370,
        y: 200,
        status: 'advertencia',
        level: 1.95,
        maxLevel: 2.70,
        battery: 92,
        trend: '+10 cm/h'
      }
    ],
    evacuationPoint: {
      name: 'Punto Seguro: Cancha El Salado (Vereda El Corazón)',
      capacity: 500,
      x: 390,
      y: 230,
      address: 'Vereda El Corazón (Límite Norte Seguro)',
      contact: 'Bomberos Medellín: 119 / Enlace Territorial Altavista'
    },
    specificInstructions: [
      {
        step: 1,
        title: 'Precaución en tramo de interfase El Corazón - San Javier',
        desc: 'Nivel en alza sostenida (+10 cm/h). Monitoree el puente de cruce hacia Betania.'
      },
      {
        step: 2,
        title: 'Punto de reunión en Cancha El Salado',
        desc: 'Ubicación amplia y sobre cota superior al lecho de la quebrada.'
      }
    ]
  },

  'red-comuna-70': {
    id: 'red-comuna-70',
    name: 'Red Hidrográfica Comuna 70',
    basinTitle: 'Red Hidrográfica Integral del Corregimiento de Altavista (Comuna 70)',
    subtitle: 'Mapa Oficial de Medellín / Google Maps: Señalización de Todas las Quebradas y sus Sectores de Paso',
    elevationRange: '2,620 - 1,488 m.s.n.m.',
    basinAreaHa: 2730,
    riverLengthKm: 28.5,
    averageSlope: '31%',
    flowVelocity: '1.6 m/s',
    ambientTemp: '18.0°C',
    criticalSector: 'Comuna 70 Completa · 9 Veredas Interconectadas',
    currentLevel: 1.85,
    maxThreshold: 2.80,
    marginCm: 95,
    fillingPercentage: 66,
    trendText: 'Red monitoreada activamente por SIATA y comunidad',
    rainIntensity: '34.5 mm/h',
    riskBadge: {
      label: 'MAPA INTEGRAL · RED HIDROGRÁFICA COMUNA 70',
      color: 'text-indigo-950',
      bg: 'bg-indigo-100',
      border: 'border-indigo-400'
    },
    // Main spine: Quebrada Altavista
    riverPathD: 'M 90 290 Q 230 300 370 310 T 540 330 T 710 350 T 880 370',
    floodAuraD: 'M 90 290 Q 230 300 370 310 T 540 330 T 710 350 T 880 370',
    criticalSegmentD: 'M 370 310 T 540 330',
    mountainContours: [
      { d: 'M 40 40 Q 240 20 460 50 T 860 30', stroke: '#94a3b8', strokeWidth: 1.5, opacity: 0.7 },
      { d: 'M 30 120 Q 270 90 520 130 T 880 100', stroke: '#94a3b8', strokeWidth: 1.5, opacity: 0.7 },
      { d: 'M 40 230 Q 300 190 580 240 T 870 210', stroke: '#cbd5e1', strokeWidth: 1.2, opacity: 0.7 },
      { d: 'M 50 430 Q 340 390 630 440 T 890 410', stroke: '#cbd5e1', strokeWidth: 1.2, opacity: 0.7 },
      { d: 'M 70 540 Q 380 500 680 550', stroke: '#e2e8f0', strokeWidth: 1.2, opacity: 0.7 }
    ],
    localRoads: [
      { d: 'M 80 310 L 350 330 L 640 350 L 880 370', strokeWidth: 3.5 }, // Calle 18 (Vía Central Altavista)
      { d: 'M 140 160 L 410 180 L 670 200 L 870 220', strokeWidth: 3 }, // Calle 30 (Aguas Frías / Los Molinos)
      { d: 'M 110 450 L 380 470 L 660 480 L 860 500', strokeWidth: 3 }, // Vía a San José del Manzanillo
      { d: 'M 420 50 L 470 330 L 520 570', strokeWidth: 2.5 } // Conexión Transversal Veredal
    ],
    landmarks: [
      { text: 'VEREDA AGUAS FRÍAS (Q. La Picacha)', x: 80, y: 95, color: '#065f46', fontSize: 12, bold: true },
      { text: 'VEREDA EL CORAZÓN - EL MORRO (Calle 30)', x: 280, y: 120, color: '#065f46', fontSize: 12, bold: true },
      { text: 'CERROS PADRE AMAYA (2,620 m · Q. Buenavista)', x: 160, y: 40, color: '#451a03', fontSize: 12.5, bold: true },
      { text: 'VEREDA BUGA - PATIO BONITO (Nacimiento)', x: 60, y: 265, color: '#1e293b', fontSize: 12, bold: true },
      { text: 'VEREDA SAN PABLO (Eje Central)', x: 370, y: 290, color: '#1e293b', fontSize: 12, bold: true },
      { text: 'SECTOR CENTRAL ALTAVISTA (Calle 18)', x: 560, y: 315, color: '#0f172a', fontSize: 12.5, bold: true },
      { text: 'VEREDA LA ESPERANZA / EL CHISPERO (Q. Las Cañadas)', x: 240, y: 400, color: '#065f46', fontSize: 12, bold: true },
      { text: 'VEREDA SAN JOSÉ DEL MANZANILLO (Q. La Guayabala)', x: 110, y: 510, color: '#065f46', fontSize: 12, bold: true },
      { text: 'VEREDA EL JARDÍN (Q. El Pelón / Guayabala)', x: 420, y: 530, color: '#065f46', fontSize: 12, bold: true },
      { text: 'DESEMBOCADURA HACIA BELÉN / RÍO MEDELLÍN', x: 670, y: 410, color: '#0369a1', fontSize: 12, bold: true }
    ],
    sensors: [
      {
        id: 'sens-402',
        name: 'Q. La Picacha (Aguas Frías)',
        code: 'SIATA-#402',
        elevation: 1950,
        x: 340,
        y: 145,
        status: 'advertencia',
        level: 2.40,
        maxLevel: 3.10,
        battery: 94,
        trend: '+15 cm/h'
      },
      {
        id: 'sens-308',
        name: 'Q. Altavista (San Pablo)',
        code: 'SIATA-#308',
        elevation: 1780,
        x: 480,
        y: 330,
        status: 'normal',
        level: 1.84,
        maxLevel: 2.50,
        battery: 98,
        trend: 'Estable'
      },
      {
        id: 'sens-512',
        name: 'Q. Buenavista (Ladrilleras)',
        code: 'SIATA-#512',
        elevation: 2020,
        x: 240,
        y: 185,
        status: 'advertencia',
        level: 2.15,
        maxLevel: 2.80,
        battery: 89,
        trend: '+22 cm/h'
      },
      {
        id: 'sens-215',
        name: 'Q. Las Cañadas (La Esperanza)',
        code: 'SIATA-#215',
        elevation: 1720,
        x: 360,
        y: 375,
        status: 'normal',
        level: 1.10,
        maxLevel: 2.40,
        battery: 99,
        trend: 'Flujo libre'
      },
      {
        id: 'sens-601',
        name: 'Q. La Guayabala (Manzanillo)',
        code: 'SIATA-#601',
        elevation: 1810,
        x: 480,
        y: 495,
        status: 'normal',
        level: 1.25,
        maxLevel: 2.60,
        battery: 96,
        trend: 'Estable'
      }
    ],
    evacuationPoint: {
      name: 'Red de Puntos Seguros: Cancha San Pablo / Coliseo Altavista / I.E. Altavista',
      capacity: 1200,
      x: 620,
      y: 360,
      address: 'Calle 18 Sector Central y Canchas Polideportivas',
      contact: 'Bomberos Medellín: 119 / Central de Monitoreo Altavista'
    },
    incidentAlert: {
      text: 'Mapa Oficial Comuna 70: Monitoreo conjunto de las cuencas de Altavista',
      x: 450,
      y: 70,
      severity: 'info'
    },
    specificInstructions: [
      {
        step: 1,
        title: 'Identifique la quebrada más cercana a su vivienda',
        desc: 'Comuna 70 cuenta con 5 ejes hídricos principales: Altavista, La Picacha/Aguas Frías, Buenavista, Las Cañadas (La Esperanza) y La Guayabala.'
      },
      {
        step: 2,
        title: 'Consulte las veredas por donde pasa cada cauce',
        desc: 'Revise la tabla hidrográfica georreferenciada con Google Maps para conocer los puntos de confluencia y puentes críticos.'
      },
      {
        step: 3,
        title: 'Verificación en Google Maps en tiempo real',
        desc: 'Utilice el botón de enlace satelital para visualizar la orografía y relieve en la plataforma oficial de mapas.'
      }
    ]
  }
};

export const COMUNA_70_QUEBRADAS_NETWORK: QuebradaNetworkBranch[] = [
  {
    id: 'altavista-main',
    name: 'Quebrada Altavista (Eje Principal)',
    veredasPassed: 'Veredas Buga → Patio Bonito → San Pablo → Sector Central Altavista (Calle 18) → Belén Rincón → Río Medellín',
    pathD: 'M 90 290 Q 230 300 370 310 T 540 330 T 710 350 T 880 370',
    color: '#0284c7',
    glowColor: '#38bdf8',
    strokeWidth: 8,
    labelX: 520,
    labelY: 345,
    status: 'seguro',
    googleMapsRef: 'Quebrada Altavista, Medellín, Antioquia'
  },
  {
    id: 'picacha-branch',
    name: 'Quebrada La Picacha / Aguas Frías',
    veredasPassed: 'Alto de los Santeros → Vereda Aguas Frías (Droguería) → Calle 31B → Altos del Castillo Etapa 1 → Universidad de Medellín → Belén Los Molinos (Calle 30)',
    pathD: 'M 80 100 Q 180 135 300 150 T 480 160 T 660 170 T 880 160',
    color: '#d97706',
    glowColor: '#fbbf24',
    strokeWidth: 6.5,
    labelX: 470,
    labelY: 145,
    status: 'alerta_amarilla',
    googleMapsRef: 'Universidad de Medellín, Quebrada La Picacha, Medellín'
  },
  {
    id: 'buenavista-branch',
    name: 'Quebrada Buenavista',
    veredasPassed: 'Cerros Padre Amaya (2,620m) → Vereda El Morro → Sector Ladrilleras San Judas → Vía El Morro km 2.5 → Disipador Box-Culvert',
    pathD: 'M 170 50 L 250 110 L 320 160 L 420 220 L 520 280 L 540 330',
    color: '#ea580c',
    glowColor: '#f97316',
    strokeWidth: 5.5,
    labelX: 300,
    labelY: 195,
    status: 'alerta_naranja',
    googleMapsRef: 'Quebrada Buenavista, Altavista, Medellín'
  },
  {
    id: 'canadas-branch',
    name: 'Quebrada Las Cañadas / La Esperanza',
    veredasPassed: 'Vereda La Esperanza Alta (2,180m) → Sector El Chispero → Puente Peatonal La Esperanza (Calle 18A) → Vereda San Pablo (Confluencia Q. Altavista)',
    pathD: 'M 200 440 Q 280 420 350 390 T 430 360 T 490 330',
    color: '#10b981',
    glowColor: '#34d399',
    strokeWidth: 5.5,
    labelX: 280,
    labelY: 375,
    status: 'seguro',
    googleMapsRef: 'Vereda La Esperanza, Altavista, Medellín'
  },
  {
    id: 'guayabala-branch',
    name: 'Quebrada La Guayabala',
    veredasPassed: 'Cuchilla El Barcino (2,300m) → Vereda San José del Manzanillo → Vereda El Jardín → Sector Las Camelias → Belén Rincón / Rodeo Alto',
    pathD: 'M 90 530 Q 240 520 390 510 T 570 490 T 730 470 T 880 460',
    color: '#059669',
    glowColor: '#10b981',
    strokeWidth: 6.5,
    labelX: 530,
    labelY: 510,
    status: 'seguro',
    googleMapsRef: 'Quebrada La Guayabala, Manzanillo, Medellín'
  },
  {
    id: 'pelon-branch',
    name: 'Quebrada El Pelón',
    veredasPassed: 'Vereda San José del Manzanillo (Sector San José) → Obras de canalización Mi Río Mis Quebradas → Tributario de Q. La Guayabala',
    pathD: 'M 190 570 Q 280 550 360 530 T 440 510',
    color: '#0891b2',
    glowColor: '#06b6d4',
    strokeWidth: 4.5,
    labelX: 250,
    labelY: 560,
    status: 'seguro',
    googleMapsRef: 'Quebrada El Pelón, Altavista, Medellín'
  },
  {
    id: 'buga-barcino-branch',
    name: 'Quebradas Buga y El Barcino (Cabeceras)',
    veredasPassed: 'Vereda Buga y Cuchilla El Barcino → Punto de Confluencia inicial (1,720 msnm) que forma la Quebrada Altavista',
    pathD: 'M 40 260 L 90 290 M 40 330 L 90 290',
    color: '#0284c7',
    glowColor: '#38bdf8',
    strokeWidth: 5,
    labelX: 60,
    labelY: 260,
    status: 'seguro',
    googleMapsRef: 'Vereda Buga, Altavista, Medellín'
  },
  {
    id: 'ana-diaz-branch',
    name: 'Quebrada Ana Díaz',
    veredasPassed: 'Costado Norte Vereda El Corazón (Límite con Comuna 13) → Baja hacia San Javier y Belén',
    pathD: 'M 350 70 Q 480 60 620 65 T 820 70',
    color: '#6366f1',
    glowColor: '#818cf8',
    strokeWidth: 4.5,
    labelX: 530,
    labelY: 55,
    status: 'seguro',
    googleMapsRef: 'Quebrada Ana Diaz, Medellín'
  }
];
