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
  status: 'pendiente_aprobacion' | 'aprobado' | 'rechazado';
  verified: boolean;
  rejectionReason?: string;
}

export const STORAGE_REPORTS_KEY = 'overflows_citizen_reports_moderated_v1';

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
  quebrada: string;
  level: 'bajo_muro' | 'al_puente' | 'desbordada';
  description: string;
  media: ReportMediaItem[];
}): CitizenReportRecord {
  const newReport: CitizenReportRecord = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userName: reportData.userName,
    userRole: reportData.userRole,
    userEmail: reportData.userEmail,
    sector: reportData.sector,
    quebrada: reportData.quebrada,
    level: reportData.level,
    description: reportData.description,
    timestamp: 'Justo ahora',
    createdAt: new Date().toISOString(),
    media: reportData.media,
    status: 'pendiente_aprobacion', // Must be verified and approved by admin before public listing
    verified: false
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
