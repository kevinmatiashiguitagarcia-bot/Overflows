// Complete 100% Internationalization mapping for SIATA stations, localized directives, and evacuation zones

export interface LocalizedInstruction {
  step: number;
  title: string;
  desc: string;
}

export interface LocalizedEvacuationPoint {
  id: string;
  name: string;
  address: string;
  contact: string;
  capacity?: number;
  lat?: number;
  lng?: number;
  x?: number;
  y?: number;
  googleMapsQuery?: string;
}

const STATION_NAME_MAP_EN: Record<string, string> = {
  'Estación Hidrológica SIATA #405 - Aguas Frías': 'SIATA Hydrological Station #405 - Aguas Frías',
  'Estación Hidrológica SIATA #405 (Aguas Frías)': 'SIATA Hydrological Station #405 (Aguas Frías)',
  'Estación SIATA #405 (Aguas Frías)': 'SIATA Station #405 (Aguas Frías)',
  'Estación Hidrológica SIATA #308 - Puente San Pablo': 'SIATA Hydrological Station #308 - San Pablo Bridge',
  'Estación Hidrológica SIATA #308 (Puente San Pablo)': 'SIATA Hydrological Station #308 (San Pablo Bridge)',
  'Estación Pluviométrica y Nivel SIATA #512 - Padre Amaya': 'SIATA Rain & Level Station #512 - Padre Amaya',
  'Estación Pluviométrica y Nivel SIATA #512 (Padre Amaya)': 'SIATA Rain & Level Station #512 (Padre Amaya)',
  'Estación Nivel SIATA #215 - El Chispero': 'SIATA Level Station #215 - El Chispero',
  'Estación Nivel SIATA #215 (El Chispero)': 'SIATA Level Station #215 (El Chispero)',
  'Estación Hidrológica SIATA #618 - Manzanillo': 'SIATA Hydrological Station #618 - Manzanillo',
  'Estación Hidrológica SIATA #618 (Manzanillo)': 'SIATA Hydrological Station #618 (Manzanillo)',
  'Estación Hidrológica SIATA #621 - Alto Manzanillo': 'SIATA Hydrological Station #621 - Alto Manzanillo',
  'Estación Hidrológica SIATA #621 (Alto Manzanillo)': 'SIATA Hydrological Station #621 (Alto Manzanillo)',
  'Estación Nivel SIATA #314 - Ana Díaz': 'SIATA Level Station #314 - Ana Díaz',
  'Estación Nivel SIATA #314 (Ana Díaz)': 'SIATA Level Station #314 (Ana Díaz)',
  'Estación Pluviométrica SIATA #520 - El Morro Alto': 'SIATA Rainfall Station #520 - El Morro Alto',
  'Estación Pluviométrica SIATA #520 (El Morro Alto)': 'SIATA Rainfall Station #520 (El Morro Alto)',
  'Red Metropolitana de Sensores Hidrológicos SIATA': 'SIATA Metropolitan Hydrological Sensor Network'
};

const INSTRUCTION_TRANSLATIONS_EN: Record<string, { title: string; desc: string }> = {
  // Aguas Frías (La Picacha)
  'Monitoree el cauce superior en Vereda Aguas Frías y Droguería': {
    title: 'Monitor upper channel in Vereda Aguas Frías and Drugstore area',
    desc: 'Stream flows parallel to the main road past Aguas Frías Drugstore. Alert if you observe debris or sudden turbidity.'
  },
  'Vigilancia en sector Calle 31B y Altos del Castillo Etapa 1': {
    title: 'Surveillance in Calle 31B and Altos del Castillo Stage 1 sector',
    desc: 'Around the curve facing Altos del Castillo, water velocity increases due to canyon slope. Avoid walking near bank edges.'
  },
  'Punto seguro en Universidad de Medellín y corredor Calle 30': {
    title: 'Safe point at Universidad de Medellín and Calle 30 corridor',
    desc: 'In case of overflow risk, head to elevated zones of the Universidad de Medellín campus or the safe Calle 30 platform outside the canal.'
  },

  // Altavista Central
  'Verifique los niveles en Puente San Pablo y Sector Central': {
    title: 'Check water levels at San Pablo Bridge and Central Sector',
    desc: 'At San Pablo Bridge, La Esperanza stream converges with Altavista stream. This is the critical monitoring point if water contacts the retaining walls.'
  },
  'Mantenga libres los canales de desagüe veredal': {
    title: 'Keep rural drainage culverts and ditches clear',
    desc: 'Avoid debris accumulation on slopes of Buga and Patio Bonito sectors to prevent upstream damming.'
  },
  'Punto seguro de evacuación en caso de incremento súbito': {
    title: 'Safe evacuation point in case of sudden water rise',
    desc: 'Head to Institución Educativa Débora Arango Pérez (Carrera 89B #18-20, San Pablo). Offers spacious elevated ground to shelter neighbors.'
  },

  // Buenavista
  'Atención a ruidos sordos de piedras en la ladera': {
    title: 'Watch for dull rumbling sounds from stones along the slope',
    desc: 'Given the steep slope (32%) along Padre Amaya hills, the current moves rocky debris rapidly.'
  },
  'Evite pasar bajo el Box-Culvert de Vía El Morro': {
    title: 'Avoid crossing under the Box-Culvert on Vía El Morro',
    desc: 'The underground culvert often clogs with mud during torrential rains. Seek alternate routes along the upper ridge.'
  },
  'Refugio seguro en Escuela Rural Buenavista': {
    title: 'Safe shelter at Buenavista Rural School',
    desc: 'Elevated assembly point situated safely outside landslide and flood hazard zones.'
  },

  // La Esperanza
  'Verifique el paso en el Puente de la Calle 18A': {
    title: 'Check bridge crossing at Calle 18A',
    desc: 'Visual gauging spot where the current narrows before joining the main Altavista axis.'
  },
  'Monitoreo en ladera de El Chispero': {
    title: 'Slope monitoring at El Chispero sector',
    desc: 'High-runoff terrain; supervise fissures on retaining walls or gabions.'
  },
  'Punto de encuentro seguro en la Placa Polideportiva': {
    title: 'Safe meeting point at the Multi-sports Court',
    desc: 'Open, well-ventilated area on safe elevation to coordinate with community leaders.'
  },

  // La Guayabala
  'Vigilancia en Sector Las Camelias': {
    title: 'Surveillance in Las Camelias Sector',
    desc: 'Meander zone where water level rises quickly following rainfall on Cuchilla El Barcino.'
  },
  'Mantenimiento de cunetas veredales': {
    title: 'Maintenance of rural roadway ditches',
    desc: 'Ensure surface runoff waters do not drain directly into unstable roadside slopes.'
  },
  'Ruta hacia la Placa Polideportiva': {
    title: 'Route towards the Multi-sports Court',
    desc: 'Primary evacuation route towards the San José del Manzanillo Multi-sports Court.'
  },

  // El Manzanillo
  'Revisión en el camino veredal': {
    title: 'Inspection along the rural pathway',
    desc: 'Monitor the natural stream channel along the San José access roadway.'
  },
  'Verificación del paso hacia La Guayabala': {
    title: 'Verify passage towards La Guayabala',
    desc: 'Ensure unimpeded runoff at the confluence of micro-basins.'
  },

  // El Barcino
  'Protección de franja de reserva forestal': {
    title: 'Protection of forest reserve buffer zone',
    desc: 'Maintain vegetal ground cover in upper basin headwaters to mitigate torrential surges.'
  },
  'Monitoreo de lluvias orográficas': {
    title: 'Monitoring of orographic rainfall',
    desc: 'In the high mountains, rainfall events are typically denser and more sudden.'
  },

  // El Corazón
  'Vigilancia en tramo de interfase El Corazón - San Javier': {
    title: 'Surveillance at El Corazón - San Javier interface segment',
    desc: 'Supervise pedestrian access paths and perimeter storm channels.'
  },
  'Punto de reunión en Cancha El Salado': {
    title: 'Assembly point at El Salado Sports Field',
    desc: 'Clear area for temporary shelter of families from the northern slope.'
  },

  // Todas (Red Global)
  'Identifique la quebrada más cercana a su vivienda': {
    title: 'Identify the stream closest to your home',
    desc: 'Comuna 70 contains multiple stream channels draining towards the Medellín River.'
  },
  'Consulte las veredas por donde pasa cada cauce': {
    title: 'Consult the rural sectors crossed by each stream',
    desc: 'Know the upstream segments to anticipate flash surges.'
  },
  'Verificación en Google Maps en tiempo real': {
    title: 'Real-time Google Maps verification',
    desc: 'Visualize satellite georeferencing and alert status simultaneously.'
  }
};

const EVAC_POINTS_MAP_EN: Record<string, { name: string; address: string }> = {
  'Universidad de Medellín (Campus Principal - Zona Alta)': {
    name: 'Universidad de Medellín (Main Campus - Upper Safe Zone)',
    address: 'Carrera 87 #30-65 (UdeM Campus) and Central Aguas Frías Sector'
  },
  'Institución Educativa Débora Arango Pérez': {
    name: 'Institución Educativa Débora Arango Pérez (Main Campus)',
    address: 'Carrera 89B #18-20, San Pablo Altavista'
  },
  'Escuela Rural Buenavista': {
    name: 'Buenavista Rural School',
    address: 'Sector Canteras, Vía El Morro'
  },
  'Placa Polideportiva La Esperanza': {
    name: 'La Esperanza Multi-sports Court',
    address: 'Calle 18A #92-40, Sector El Chispero'
  },
  'Placa Polideportiva San José del Manzanillo': {
    name: 'San José del Manzanillo Multi-sports Court',
    address: 'Vereda San José del Manzanillo, Vía Principal'
  },
  'Capilla San José del Manzanillo': {
    name: 'San José del Manzanillo Community Chapel',
    address: 'Sector Central San José'
  },
  'Plaza Cívica Vereda Buga': {
    name: 'Vereda Buga Civic Plaza',
    address: 'Vereda Buga - Sector Alto'
  },
  'Cancha Polideportiva El Salado': {
    name: 'El Salado Multi-sports Field',
    address: 'Sector El Corazón - Límite Comuna 13'
  },
  'Centro Cívico y Casa de Gobierno Altavista': {
    name: 'Altavista Civic Center & Government House',
    address: 'Calle 18 #103-12, Sector Central Altavista'
  }
};

const CRITICAL_SECTORS_MAP_EN: Record<string, string> = {
  'Droguería Aguas Frías · Altos del Castillo · U. de Medellín': 'Aguas Frías Drugstore · Altos del Castillo · U. of Medellín',
  'Vereda San Pablo · Sector Central Altavista': 'Vereda San Pablo · Central Altavista Sector',
  'Sector Canteras · Paso Box-Culvert Vía El Morro': 'Canteras Sector · Box-Culvert Crossing Vía El Morro',
  'Puente Calle 18A · Ladera El Chispero': 'Calle 18A Bridge · El Chispero Slope',
  'Sector Las Camelias · Tramo San José': 'Las Camelias Sector · San José Segment',
  'Camino Veredal San José · Confluencia': 'San José Rural Path · Confluence',
  'Cabecera Alta · Cuchilla El Barcino': 'Upper Headwaters · Cuchilla El Barcino Ridge',
  'Interfase El Corazón · Conexión San Javier': 'El Corazón Interface · San Javier Connection',
  'Múltiples Puntos Críticos en Comuna 70': 'Multiple Critical Points across Comuna 70'
};

export function getLocalizedStationName(stationName: string | undefined, language: 'es' | 'en'): string {
  if (!stationName) return '';
  if (language === 'es') return stationName;
  return STATION_NAME_MAP_EN[stationName] || stationName.replace('Estación Hidrológica', 'SIATA Hydrological Station').replace('Estación', 'Station');
}

export function getLocalizedInstruction(
  instruction: { step: number; title: string; desc: string },
  language: 'es' | 'en'
): LocalizedInstruction {
  if (language === 'es') {
    return instruction;
  }
  const match = INSTRUCTION_TRANSLATIONS_EN[instruction.title];
  if (match) {
    return {
      step: instruction.step,
      title: match.title,
      desc: match.desc
    };
  }
  return instruction;
}

export function getLocalizedEvacuationPoint(
  evac: { id: string; name: string; address: string; contact: string; capacity?: number; lat?: number; lng?: number; x?: number; y?: number; googleMapsQuery?: string },
  language: 'es' | 'en'
): LocalizedEvacuationPoint {
  if (language === 'es') {
    return evac;
  }
  const match = EVAC_POINTS_MAP_EN[evac.name];
  if (match) {
    return {
      ...evac,
      name: match.name,
      address: match.address
    };
  }
  return evac;
}

export function getLocalizedCriticalSector(sector: string | undefined, language: 'es' | 'en'): string {
  if (!sector) return '';
  if (language === 'es') return sector;
  return CRITICAL_SECTORS_MAP_EN[sector] || sector;
}
