export type ProfileType = 'comunidad' | 'administrativo';

export type UserRole = 'habitante' | 'vigia' | 'administrador';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  barrioSector: string;
  createdAt: string;
  dataTreatmentAccepted: boolean;
  avatarUrl?: string;
  role?: UserRole;
  profileType?: ProfileType;
}

export type RiskLevel = 'seguro' | 'alerta_amarilla' | 'alerta_naranja' | 'alerta_roja';

export interface CuencaData {
  id: string;
  name: string;
  sector: string;
  capacityPercentage: number;
  status: RiskLevel;
  siataStationName: string;
  siataStationId: string;
  rainIntensityMmH: number; // mm/h from SIATA
  flowRate: number; // m³/s
  speed: number; // m/s
  trend: 'ascendente' | 'estable' | 'alza_rapida' | 'descendente';
  currentLevel: number; // meters
  maxThreshold: number; // meters
  margin: number; // cm
  lastReadingTime: string;
  communityStatus: string;
  description: string;
  criticalPoints: string[];
  historyPoints: number[];
}

export interface VigiaReport {
  id: string;
  authorName: string;
  authorRole?: string;
  isVerified: boolean;
  timestamp: string;
  timeAgo: string;
  content: string;
  location: string;
  imageAttached?: boolean;
  imageUrl?: string;
  protocolPhase?: string;
}

export interface CitizenReportInput {
  riverLevel: 'bajo_muro' | 'al_puente' | 'desbordada';
  locationSector: string;
  hasObstructionNotes: string;
}

export interface CitizenReportRecord extends CitizenReportInput {
  id: string;
  createdAt: string;
  status: 'pendiente' | 'revisado' | 'atendido';
}

