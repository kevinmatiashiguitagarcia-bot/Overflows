/**
 * Citizen Reports Moderation and Persistence Service
 * Strictly adheres to administrative pre-approval before community visibility.
 * No default mock reports.
 */

export interface ReportMediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size?: string;
}

export interface CitizenReportRecord {
  id: string;
  userName: string;
  userRole: string;
  userEmail?: string;
  sector: string;
  quebrada: string;
  level: 'bajo_muro' | 'al_puente' | 'desbordada';
  description: string;
  timestamp: string;
  createdAt: string;
  media: ReportMediaItem[];
  status: 'pendiente_aprobacion' | 'aprobado' | 'rechazado' | 'requiere_revision_especial';
  verified: boolean;
  rejectionReason?: string;
  specialReviewEmail?: string;
  notifiedToAdmin?: boolean;
}

export const STORAGE_REPORTS_KEY = 'overflows_citizen_reports_moderated_v1';

export function getQuebradaBySector(sector?: string): string {
  if (!sector) return 'Quebrada Altavista';
  const s = sector.toLowerCase();
  if (
    s.includes('aguas frías') ||
    s.includes('aguas frias') ||
    s.includes('morro plan') ||
    s.includes('picacha') ||
    s.includes('castillo') ||
    s.includes('brisas')
  ) {
    return 'Quebrada La Picacha / Aguas Frías';
  }
  if (s.includes('esperanza') || s.includes('chispero') || s.includes('cañada')) {
    return 'Quebrada Las Cañadas';
  }
  if (
    s.includes('morro') ||
    s.includes('corazón') ||
    s.includes('buenavista') ||
    s.includes('judas') ||
    s.includes('amaya')
  ) {
    return 'Quebrada Buenavista';
  }
  if (
    s.includes('manzanillo') ||
    s.includes('jardín') ||
    s.includes('guayabala') ||
    s.includes('camelias') ||
    s.includes('rodeo')
  ) {
    return 'Quebrada La Guayabala';
  }
  if (s.includes('pelon') || s.includes('pelón')) {
    return 'Quebrada El Pelón';
  }
  if (s.includes('ana diaz') || s.includes('ana díaz')) {
    return 'Quebrada Ana Díaz';
  }
  return 'Quebrada Altavista';
}

export function getStoredReports(): CitizenReportRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading citizen reports from storage:', err);
  }
  return [];
}

export function saveStoredReports(reports: CitizenReportRecord[]): void {
  try {
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
    // Dispatch custom event for real-time sync across components in the same window
    window.dispatchEvent(new Event('overflows_reports_updated'));
  } catch (err) {
    console.error('Error saving citizen reports to storage:', err);
  }
}

export function createCitizenReport(reportData: {
  userName: string;
  userRole: string;
  userEmail?: string;
  sector: string;
  quebrada?: string;
  level: 'bajo_muro' | 'al_puente' | 'desbordada';
  description: string;
  media: ReportMediaItem[];
  status?: 'pendiente_aprobacion' | 'requiere_revision_especial';
}): CitizenReportRecord {
  const finalStatus = reportData.status || 'pendiente_aprobacion';
  const finalQuebrada = reportData.quebrada || getQuebradaBySector(reportData.sector);

  const newReport: CitizenReportRecord = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userName: reportData.userName,
    userRole: reportData.userRole,
    userEmail: reportData.userEmail,
    sector: reportData.sector,
    quebrada: finalQuebrada,
    level: reportData.level,
    description: reportData.description,
    timestamp: 'Justo ahora',
    createdAt: new Date().toISOString(),
    media: reportData.media,
    status: finalStatus,
    verified: false,
    specialReviewEmail:
      finalStatus === 'requiere_revision_especial' ? 'overflowsoficial01@gmail.com' : undefined,
    notifiedToAdmin: finalStatus === 'requiere_revision_especial'
  };

  const current = getStoredReports();
  const updated = [newReport, ...current];
  saveStoredReports(updated);
  return newReport;
}

export function approveCitizenReport(reportId: string): CitizenReportRecord | null {
  const current = getStoredReports();
  const index = current.findIndex((r) => r.id === reportId);
  if (index === -1) return null;

  const updatedReport: CitizenReportRecord = {
    ...current[index],
    status: 'aprobado',
    verified: true
  };

  current[index] = updatedReport;
  saveStoredReports(current);
  return updatedReport;
}

export function rejectCitizenReport(reportId: string, reason?: string): CitizenReportRecord | null {
  const current = getStoredReports();
  const index = current.findIndex((r) => r.id === reportId);
  if (index === -1) return null;

  const updatedReport: CitizenReportRecord = {
    ...current[index],
    status: 'rechazado',
    verified: false,
    rejectionReason: reason || 'Evidencia no concluyente o duplicada'
  };

  current[index] = updatedReport;
  saveStoredReports(current);
  return updatedReport;
}

export function deleteCitizenReport(reportId: string): boolean {
  const current = getStoredReports();
  const filtered = current.filter((r) => r.id !== reportId);
  saveStoredReports(filtered);
  return true;
}
