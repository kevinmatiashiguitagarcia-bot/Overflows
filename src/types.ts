export type ProfileType = 'comunidad' | 'administrativo';

export type UserRole = 'habitante' | 'vigia' | 'administrador';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileType: ProfileType;
  role: UserRole;
  barrioSector: string;
  createdAt: string;
  avatarUrl?: string;
}

export type RiskLevel = 'seguro' | 'alerta_amarilla' | 'alerta_naranja' | 'alerta_roja';

export interface CuencaData {
  id: string;
  name: string;
  sector: string;
  capacityPercentage: number;
  status: RiskLevel;
  batteryPercentage: number;
  flowRate: number; // m³/s
  speed: number; // m/s
  sensorModel: string;
  sensorId: string;
  trend: 'ascendente' | 'estable' | 'alza_rapida' | 'descendente';
  currentLevel: number; // meters
  maxThreshold: number; // meters
  margin: number; // cm
  lastReadingTime: string;
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
