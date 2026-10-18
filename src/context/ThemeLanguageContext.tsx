import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'es' | 'en';

interface ThemeLanguageContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, defaultText?: string) => string;
}

const STORAGE_THEME_KEY = 'overflows_altavista_theme_v2';
const STORAGE_LANG_KEY = 'overflows_altavista_language_v2';

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  es: {
    // App Branding
    'app.title': 'Overflows Altavista',
    'app.subtitle': 'Sistema Comunitario de Alerta Temprana · Comuna 70',
    'app.location': 'Corregimiento de Altavista · Medellín, Antioquia',
    'app.protected_access': 'Acceso Protegido',

    // Navigation
    'nav.dashboard': 'Mi Quebrada',
    'nav.dashboard_admin': 'Supervisión de Cuencas',
    'nav.map': 'Mapa de Riesgo SIATA',
    'nav.reports': 'Reportes Ciudadanos',
    'nav.profile': 'Ver Perfil',
    'nav.logout': 'Cerrar Sesión',
    'nav.delete_account': 'Eliminar Cuenta',
    'nav.home': 'Inicio',

    // Clock & Status
    'clock.title': 'Hora Oficial Medellín',
    'clock.live': 'En Vivo',
    'clock.sync': 'Sincronización Telemetría:',
    'status.active': 'Alerta Temprana Activa',
    'status.normal': 'Normalidad Hidrológica',
    'status.normal_title': 'ESTADO HIDROLÓGICO: CONDICIONES SEGURAS Y FLUJO NORMAL',
    'status.normal_desc': 'Precipitaciones mínimas registradas en la cabecera de Altavista. Cauces despejados y operando en niveles óptimos sin riesgo de desborde.',
    'status.synchronized': 'Sincronizado con la red de sensores hidrológicos metropolitanos',
    'status.updated_ago': 'ACTUALIZADO HACE',
    'status.view_recommendations': 'Ver recomendaciones',

    // Auth
    'auth.login_title': 'Iniciar Sesión en Overflows',
    'auth.register_title': 'Crear cuenta',
    'auth.login_subtitle': 'Accede al sistema comunitario de alerta temprana y monitoreo de quebradas.',
    'auth.register_subtitle': 'Regístrate para reportar novedades del cauce y recibir avisos preventivos.',
    'auth.login_tab': 'Iniciar Sesión',
    'auth.register_tab': 'Registrarme',
    'auth.email_or_phone': 'Correo electrónico',
    'auth.email_or_phone_placeholder': 'Ingresa tu correo',
    'auth.password': 'Contraseña',
    'auth.password_placeholder': '••••••••',
    'auth.remember_me': 'Recordar sesión en este dispositivo',
    'auth.forgot_password': '¿Olvidaste tu contraseña?',
    'auth.login_button': 'Iniciar Sesión',
    'auth.register_button': 'Crear cuenta',
    'auth.full_name': 'Nombre completo',
    'auth.full_name_placeholder': 'Nombre y apellidos',
    'auth.email': 'Correo electrónico',
    'auth.email_placeholder': 'correo@ejemplo.com',
    'auth.sector': 'Sector o vereda en Altavista',
    'auth.create_password': 'Crear contraseña (mínimo 6 caracteres)',
    'auth.or_continue_with': 'O continúa con',
    'auth.google_signin': 'Continuar con Google',
    'auth.google_register': 'Registrarse con Google',
    'auth.data_treatment_consent': 'Autorizo el tratamiento de mis datos personales según la normativa digital y la Ley 1581 de 2012 (Habeas Data) para la recepción de alertas tempranas hidrológicas y comunicaciones comunitarias.',
    'auth.read_privacy_policy': 'Leer Política de Tratamiento de Datos Personales',

    // Auth Validations
    'auth.err_empty_identifier': 'Por favor ingresa tu correo electrónico.',
    'auth.err_empty_password': 'Por favor ingresa tu contraseña.',
    'auth.err_invalid_credentials': 'Contraseña incorrecta. Por favor intenta de nuevo.',
    'auth.err_user_not_found': 'No se encontró ninguna cuenta asociada a este correo electrónico. Por favor verifica tus datos o crea una cuenta.',
    'auth.err_invalid_email': 'Por favor ingresa un correo electrónico válido.',
    'auth.err_short_password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth.err_data_treatment': 'Debes autorizar el tratamiento de datos personales conforme a la Ley 1581 de 2012 para registrarte.',
    'auth.err_existing_email': 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.',
    'auth.success_login': '¡Bienvenido! Sesión iniciada correctamente.',
    'auth.success_register': '¡Cuenta creada con éxito! Bienvenido a la red comunitaria.',
    'auth.success_google': 'Autenticación con Google completada con éxito.',

    // Password Recovery Flow
    'recovery.title': 'Recuperación Segura de Contraseña',
    'recovery.step1_title': 'Paso 1: Identificación de Cuenta',
    'recovery.step1_desc': 'Ingresa tu correo electrónico registrado para enviarte un código cifrado de verificación.',
    'recovery.step2_title': 'Paso 2: Código de Verificación',
    'recovery.step2_desc': 'Ingresa el código de 6 dígitos que hemos enviado a tu bandeja de correo.',
    'recovery.step3_title': 'Paso 3: Establecer Nueva Contraseña',
    'recovery.step3_desc': 'Crea una contraseña segura de al menos 6 caracteres para proteger tu cuenta.',
    'recovery.send_code': 'Enviar Código a mi Correo',
    'recovery.verify_code': 'Verificar Código',
    'recovery.save_password': 'Guardar Nueva Contraseña',
    'recovery.code_sent': 'Código de verificación de 6 dígitos enviado exitosamente a tu correo electrónico.',
    'recovery.resend_code': 'Reenviar código al correo',
    'recovery.new_password': 'Nueva Contraseña',
    'recovery.confirm_password': 'Confirmar Nueva Contraseña',
    'recovery.err_passwords_dont_match': 'Las contraseñas no coinciden. Por favor verifica.',
    'recovery.success': '¡Contraseña restablecida con éxito! Ahora puedes iniciar sesión con tu nueva contraseña.',
    'recovery.back_to_login': 'Volver al Inicio de Sesión',

    // Map & Layers
    'map.title': 'Mapa de Riesgo en Vivo',
    'map.layer_flood': 'Área Inundación',
    'map.layer_evac': 'Puntos Seguros',
    'map.layer_sensors': 'Estaciones SIATA',
    'map.standard_mode': 'Modo Estándar',
    'map.satellite_mode': 'Modo Satélite',
    'map.recenter': 'Centrar en mi Quebrada',
    'map.google_maps': 'Abrir en Google Maps',
    'map.legend_title': 'Convenciones de Riesgo',
    'map.risk_green': 'Verde: Normal / Flujo Seguro (<50%)',
    'map.risk_yellow': 'Amarillo: Vigilancia Preventiva (50-70%)',
    'map.risk_orange': 'Naranja: Precaución en Puente (70-85%)',
    'map.risk_red': 'Rojo: Alerta de Desbordamiento (>85%)',

    // Citizen Reports
    'reports.title': 'Reportes Ciudadanos',
    'reports.subtitle': 'Observación comunitaria en terreno con evidencia fotográfica y en video.',
    'reports.new_button': 'Crear Reporte del Cauce',
    'reports.media_required': 'Es obligatorio adjuntar al menos una foto o video del cauce.',
    'reports.zone_restricted': 'Reporte restringido estrictamente a tu sector asignado:',
    'reports.level_label': 'Nivel Observado en el Cauce:',
    'reports.desc_label': 'Descripción de la situación observada:',
    'reports.desc_placeholder': 'Describe sedimentos, palizadas, nivel relativo o comportamientos del agua...',
    'reports.attach_files': 'Adjuntar Fotos o Videos',
    'reports.submit_button': 'Enviar Reporte para Aprobación',
    'reports.submitting': 'Enviando evidencia...',
    'reports.pending_approval_notice': 'Tu reporte ha sido enviado al equipo administrativo para verificación y aprobación previa antes de publicarse en la red comunitaria.',
    'reports.admin_moderation_title': 'Panel de Moderación de Reportes (Administrador)',
    'reports.admin_moderation_desc': 'Revisión y validación obligatoria de reportes ciudadanos antes de su visibilidad pública.',
    'reports.approve_action': 'Aprobar y Publicar',
    'reports.reject_action': 'Rechazar / Descartar',
    'reports.approved_badge': 'Aprobado y Verificado',
    'reports.pending_badge': 'Pendiente de Moderación',
    'reports.special_review_badge': 'Requiere Revisión Especial',
    'reports.forwarded_admin': 'Remitido a overflowsoficial01@gmail.com',
    'reports.empty_title': 'Sin reportes comunitarios pendientes',
    'reports.empty_desc': 'Las condiciones se reportan en calma. Cuando los habitantes envíen novedades con fotos o videos, aparecerán aquí para verificación.',
    'reports.level_bajo_muro': 'Bajo Muro (Normal)',
    'reports.level_bajo_muro_desc': 'Flujo normal sin riesgo aparente',
    'reports.level_al_puente': 'Nivel al Puente',
    'reports.level_al_puente_desc': 'Agua rozando o alcanzando estribos',
    'reports.level_desbordada': 'Desbordada / Creciente',
    'reports.level_desbordada_desc': 'Agua rebasando márgenes o vías',
    'reports.mandatory_tag': '(OBLIGATORIO)',
    'reports.photos_or_videos': 'Fotos o Videos',
    'reports.photos_or_videos_rule': 'Para garantizar la veracidad del monitoreo hidrológico, es obligatorio subir al menos una foto o video del cauce.',
    'reports.select_files_button': 'Seleccionar Foto o Video',
    'reports.attached_files_count': 'archivo(s) adjunto(s)',
    'reports.required_badge': 'Requerido',
    'reports.details_label': 'Detalles (empalizadas, ramas, arrastre de sedimentos)',
    'reports.authorized_sector': 'Sector Autorizado',
    'reports.locked_to_residence': 'Bloqueado a su residencia',
    'reports.validated_sector': 'Sector Validado',
    'reports.your_pending_reports': 'Tus reportes en proceso de moderación administrativa',
    'reports.your_pending_desc': 'Has enviado reportes que están siendo revisados por el administrador antes de ser visibles públicamente en la comunidad.',
    'reports.verified_reports_title': 'Reportes Aprobados y Verificados',
    'reports.report_critical_segment': 'Reportar Tramo Crítico',
    'reports.restricted_to_residence': 'Restringido estrictamente a su sector residencial asignado',
    'reports.my_quebrada_reports_only': 'Mostrando reportes verificados de tu cuenca:',
    'reports.all_quebradas': 'Todas las cuencas (Vista Admin)',
    'reports.filter_by_quebrada': 'Filtrar por cuenca',
    'reports.cancel': 'Cancelar',

    // Theme & Language Controls
    'theme.title': 'Tema Visual',
    'theme.light': 'Modo Claro',
    'theme.dark': 'Modo Oscuro',
    'theme.toggle': 'Alternar Tema',
    'lang.title': 'Idioma',
    'lang.es': 'Español',
    'lang.en': 'English'
  },
  en: {
    // App Branding
    'app.title': 'Overflows Altavista',
    'app.subtitle': 'Community Early Warning System · Comuna 70',
    'app.location': 'Altavista Township · Medellín, Colombia',
    'app.protected_access': 'Protected Access',

    // Navigation
    'nav.dashboard': 'My Stream',
    'nav.dashboard_admin': 'Basin Supervision',
    'nav.map': 'SIATA Risk Map',
    'nav.reports': 'Citizen Reports',
    'nav.profile': 'View Profile',
    'nav.logout': 'Log Out',
    'nav.delete_account': 'Delete Account',
    'nav.home': 'Home',

    // Clock & Status
    'clock.title': 'Medellín Official Time',
    'clock.live': 'Live',
    'clock.sync': 'Telemetry Sync:',
    'status.active': 'Early Warning Active',
    'status.normal': 'Hydrological Normality',
    'status.normal_title': 'HYDROLOGICAL STATUS: SAFE CONDITIONS & NORMAL FLOW',
    'status.normal_desc': 'Minimal rainfall recorded in the upper Altavista basin. Waterways clear and operating at optimal levels without flood risk.',
    'status.synchronized': 'Synchronized with metropolitan hydrological sensor network',
    'status.updated_ago': 'UPDATED',
    'status.view_recommendations': 'View recommendations',

    // Auth
    'auth.login_title': 'Sign In to Overflows',
    'auth.register_title': 'Create Account',
    'auth.login_subtitle': 'Access the community early warning system and stream monitoring.',
    'auth.register_subtitle': 'Sign up to report stream conditions and receive preventive warnings.',
    'auth.login_tab': 'Sign In',
    'auth.register_tab': 'Register',
    'auth.email_or_phone': 'Email address',
    'auth.email_or_phone_placeholder': 'Enter your email',
    'auth.password': 'Password',
    'auth.password_placeholder': '••••••••',
    'auth.remember_me': 'Remember session on this device',
    'auth.forgot_password': 'Forgot your password?',
    'auth.login_button': 'Sign In',
    'auth.register_button': 'Create Account',
    'auth.full_name': 'Full name',
    'auth.full_name_placeholder': 'First and last name',
    'auth.email': 'Email address',
    'auth.email_placeholder': 'correo@ejemplo.com',
    'auth.sector': 'Sector or vereda in Altavista',
    'auth.create_password': 'Create password (min 6 characters)',
    'auth.or_continue_with': 'Or continue with',
    'auth.google_signin': 'Continue with Google',
    'auth.google_register': 'Sign up with Google',
    'auth.data_treatment_consent': 'I authorize the processing of my personal data under privacy regulations and Law 1581 of 2012 for receiving hydrological early warnings and community communications.',
    'auth.read_privacy_policy': 'Read Personal Data Privacy Policy',

    // Auth Validations
    'auth.err_empty_identifier': 'Please enter your email address.',
    'auth.err_empty_password': 'Please enter your password.',
    'auth.err_invalid_credentials': 'Incorrect password. Please try again.',
    'auth.err_user_not_found': 'No account found matching this email address. Please check your info or create an account.',
    'auth.err_invalid_email': 'Please enter a valid email address.',
    'auth.err_short_password': 'Password must be at least 6 characters long.',
    'auth.err_data_treatment': 'You must authorize data treatment under Law 1581 to register.',
    'auth.err_existing_email': 'An account is already registered with this email. Please sign in.',
    'auth.success_login': 'Welcome! Successfully signed in.',
    'auth.success_register': 'Account created successfully! Welcome to the community network.',
    'auth.success_google': 'Google authentication completed successfully.',

    // Password Recovery Flow
    'recovery.title': 'Secure Password Recovery',
    'recovery.step1_title': 'Step 1: Account Identification',
    'recovery.step1_desc': 'Enter your registered email address to receive a secure encrypted verification code.',
    'recovery.step2_title': 'Step 2: Verification Code',
    'recovery.step2_desc': 'Enter the 6-digit code sent to your email inbox.',
    'recovery.step3_title': 'Step 3: Set New Password',
    'recovery.step3_desc': 'Create a secure password with at least 6 characters to safeguard your account.',
    'recovery.send_code': 'Send Code to my Email',
    'recovery.verify_code': 'Verify Code',
    'recovery.save_password': 'Save New Password',
    'recovery.code_sent': '6-digit verification code sent successfully to your email address.',
    'recovery.resend_code': 'Resend code to email',
    'recovery.new_password': 'New Password',
    'recovery.confirm_password': 'Confirm New Password',
    'recovery.err_passwords_dont_match': 'Passwords do not match. Please verify.',
    'recovery.success': 'Password reset successfully! You can now log in with your new password.',
    'recovery.back_to_login': 'Back to Sign In',

    // Map & Layers
    'map.title': 'Live Risk Map',
    'map.layer_flood': 'Flood Area',
    'map.layer_evac': 'Safe Points',
    'map.layer_sensors': 'SIATA Stations',
    'map.standard_mode': 'Standard Mode',
    'map.satellite_mode': 'Satellite Mode',
    'map.recenter': 'Center on My Stream',
    'map.google_maps': 'Open in Google Maps',
    'map.legend_title': 'Risk Conventions',
    'map.risk_green': 'Green: Normal / Safe Flow (<50%)',
    'map.risk_yellow': 'Yellow: Active Watch (50-70%)',
    'map.risk_orange': 'Orange: Bridge Precaution (70-85%)',
    'map.risk_red': 'Red: Flood Alert / Evacuate (>85%)',

    // Citizen Reports
    'reports.title': 'Citizen Reports',
    'reports.subtitle': 'Field community observations with mandatory photo and video evidence.',
    'reports.new_button': 'New Stream Report',
    'reports.media_required': 'Attaching at least one photo or video of the stream is mandatory.',
    'reports.zone_restricted': 'Report strictly restricted to your assigned residential sector:',
    'reports.level_label': 'Observed Stream Level:',
    'reports.desc_label': 'Description of observed situation:',
    'reports.desc_placeholder': 'Describe sediment buildup, debris, water level, or behavior...',
    'reports.attach_files': 'Attach Photos or Videos',
    'reports.submit_button': 'Submit Report for Approval',
    'reports.submitting': 'Submitting evidence...',
    'reports.pending_approval_notice': 'Your report has been submitted to the administrative team for verification and approval before being published to the community network.',
    'reports.admin_moderation_title': 'Report Moderation Panel (Administrator)',
    'reports.admin_moderation_desc': 'Mandatory review and verification of citizen reports prior to public display.',
    'reports.approve_action': 'Approve and Publish',
    'reports.reject_action': 'Reject / Dismiss',
    'reports.approved_badge': 'Approved & Verified',
    'reports.pending_badge': 'Pending Moderation',
    'reports.empty_title': 'No pending community reports',
    'reports.empty_desc': 'Conditions are currently calm. When residents submit reports with photos or videos, they will appear here for review.',

    // Theme & Language Controls
    'theme.title': 'Visual Theme',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    'theme.toggle': 'Toggle Theme',
    'lang.title': 'Language',
    'lang.es': 'Español',
    'lang.en': 'English'
  }
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'en' || saved === 'es') return saved;
    } catch {
      // fallback
    }
    return 'es';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // fallback
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, language);
      document.documentElement.lang = language;
    } catch {
      // fallback
    }
  }, [language]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (newLang: AppLanguage) => {
    setLanguageState(newLang);
  };

  const t = (key: string, defaultText?: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['es']?.[key] || defaultText || key;
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        t
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
