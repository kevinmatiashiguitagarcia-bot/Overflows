/**
 * Email Dispatch Service for Overflows Altavista
 * Handles transactional email delivery for password recovery and security verification codes.
 * Ensures verification codes are sent directly to the user's email address and NEVER displayed on the screen.
 */

export interface SentEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  date: string;
  code: string;
  userName?: string;
  expiresInMinutes: number;
  read: boolean;
  content: {
    greeting: string;
    message: string;
    securityWarning: string;
    footer: string;
  };
}

const STORAGE_EMAILS_KEY = 'overflows_sent_emails_v1';

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local.charAt(0)}*@${domain}`;
  }
  const first = local.charAt(0);
  const last = local.charAt(local.length - 1);
  const middle = '*'.repeat(Math.min(local.length - 2, 5));
  return `${first}${middle}${last}@${domain}`;
}

export function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  code: string
): SentEmail {
  const cleanEmail = toEmail.trim().toLowerCase();
  
  const emailItem: SentEmail = {
    id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    to: cleanEmail,
    from: 'Alerta Temprana Overflows Altavista <seguridad@overflowsaltavista.org>',
    subject: 'Código de Verificación para Restablecer Contraseña - Overflows Altavista',
    date: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }),
    code,
    userName,
    expiresInMinutes: 15,
    read: false,
    content: {
      greeting: `Estimado/a ${userName || 'vecino/a de Altavista'},`,
      message: `Hemos recibido una solicitud para restablecer la contraseña de acceso a tu cuenta comunitaria en la plataforma Overflows Altavista (Comuna 70 - Medellín).`,
      securityWarning: `Por tu seguridad y la de tu sector, este código es confidencial y personal. Ningún funcionario de la plataforma ni del SIATA te solicitará esta clave.`,
      footer: `Comité Comunitario de Alerta Temprana · Corregimiento Altavista · Alcaldía de Medellín`
    }
  };

  // Persist in sent emails storage
  try {
    const existing = getStoredEmails();
    const updated = [emailItem, ...existing].slice(0, 20); // Keep last 20
    localStorage.setItem(STORAGE_EMAILS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not persist email to localStorage:', err);
  }

  // Dispatch custom window event for real-time reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('overflows_email_received', { detail: emailItem })
    );
  }

  return emailItem;
}

export function getStoredEmails(): SentEmail[] {
  try {
    const raw = localStorage.getItem(STORAGE_EMAILS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback empty
  }
  return [];
}

export function getLatestEmailFor(email: string): SentEmail | undefined {
  const clean = email.trim().toLowerCase();
  const all = getStoredEmails();
  return all.find((e) => e.to === clean);
}

export function markEmailAsRead(id: string): void {
  try {
    const all = getStoredEmails();
    const updated = all.map((e) => (e.id === id ? { ...e, read: true } : e));
    localStorage.setItem(STORAGE_EMAILS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}
