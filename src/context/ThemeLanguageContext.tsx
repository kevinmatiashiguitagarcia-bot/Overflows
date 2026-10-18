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

    'reports.admin_tab_pending': 'Pendientes',
    'reports.admin_tab_special': 'Revisión Especial',
    'reports.admin_tab_approved': 'Aprobados',
    'reports.admin_tab_all': 'Todos',
    'reports.admin_role_badge': 'Rol Administrador',
    'reports.admin_approve_publish': 'Aprobar y Publicar',
    'reports.admin_reject': 'Rechazar',
    'reports.admin_delete_title': 'Eliminar registro',
    'reports.admin_delete_file': 'Eliminar archivo',
    'reports.admin_empty_section': 'No hay reportes en la sección seleccionada.',
    'reports.media_label_video': 'Video',
    'reports.media_label_photo': 'Foto',
    'reports.evidence_count': 'archivo(s) de evidencia adjunta',
    'reports.drag_drop_hint': 'Adjuntar foto o video del cauce',
    'reports.formats_hint': 'JPG, PNG, MP4 (Obligatorio)',
    'reports.review_prior_notice': 'Los reportes pasan por revisión y validación previa del equipo de alerta temprana antes de ser visibles a la comunidad.',
    'reports.empty_basin_title': 'Sin reportes para tu sector',
    'reports.empty_basin_desc': 'No hay novedades reportadas en este momento para tu cuenca. Puedes reportar cualquier cambio en el cauce cuando lo observes.',
    'reports.ai_validating_image': 'Validando evidencia hidrológica con Vision AI...',
    'reports.ai_face_detected_err': 'La imagen contiene un rostro humano o selfie. Los reportes comunitarios deben registrar exclusivamente el entorno hidrológico: cauce, quebrada, empalizadas, laderas o infraestructura afectada.',
    'reports.ai_not_hydrological_err': 'La imagen no parece registrar un entorno hidrológico o cauce. Por favor adjunta una fotografía del río, quebrada, ladera, empalizada o puente.',
    'reports.ai_vulgar_text_err': 'No se permite lenguaje vulgar u ofensivo en los reportes comunitarios. Por favor describe las condiciones del cauce de forma constructiva y respetuosa.',
    'reports.ai_ambiguous_text_notice': 'La descripción es ambigua o presenta escaso detalle hidrológico. El reporte ha sido registrado con estado "Requiere revisión especial" y remitido al correo oficial de administración (overflowsoficial01@gmail.com) para análisis previo.',
    'reports.fill_required_notes': 'Por favor describe la situación observada en el cauce.',
    'reports.status_aprobado': 'Aprobado y Público',
    'reports.status_rechazado': 'Rechazado',
    'reports.status_pendiente_aprobacion': 'Pendiente de Moderación',
    'reports.status_requiere_revision_especial': 'Requiere Revisión Especial',
    'reports.submit_immediate': 'Enviar Reporte Inmediato',
    'reports.filter_my_basin': 'Mi Cuenca Asignada',
    'reports.filter_all': 'Todas las Cuencas',
    'reports.exploration_mode_title': 'Modo Exploración Activo',
    'reports.exploration_mode_notice': 'Modo Exploración: Solo puedes emitir reportes en tu quebrada de residencia oficial. Para cambiar tu zona de residencia, dirígete a Mi Perfil.',
    'reports.btn_go_to_profile': 'Dirigirse a Mi Perfil',
    'reports.btn_return_assigned': 'Volver a Mi Quebrada',
    'reports.showing_stream_reports': 'Reportes aprobados de la cuenca:',
    'reports.admin_full_rights': 'Control Total OVERFLOWS: Puedes visualizar, emitir y moderar reportes en cualquier cuenca del sistema sin restricción de zona.',
    'map.exploration_banner': 'Modo Exploración: Visualizando datos y mapa de riesgo de otra cuenca. La emisión de reportes comunitarios está restringida a tu zona de residencia oficial.',
    'map.admin_control': 'Modo Administrador OVERFLOWS: Control total de cuencas y reporte irrestricto.',

    // Dashboard, Flow & Morphometry Translations
    'dashboard.title': 'Mi Quebrada',
    'dashboard.flow_behavior_title': 'Comportamiento del Flujo en Tiempo Real',
    'dashboard.flow_sync_desc': 'Sincronización continua de la cota hidrológica durante la última hora',
    'dashboard.preventive_threshold': 'Cota de Referencia Preventiva',
    'dashboard.threshold_tag': 'umbral',
    'dashboard.continuous_flow_laminar': 'Flujo Continuo · Laminar',
    'dashboard.morphometry_title': 'Morfometría y Características del Cauce',
    'dashboard.elevation_range': 'Rango de Cota',
    'dashboard.channel_length': 'Longitud del Cauce',
    'dashboard.average_slope': 'Pendiente Media',
    'dashboard.basin_area': 'Área de Cuenca',
    'dashboard.view_on_risk_map': 'Ver en Mapa de Riesgo',
    'dashboard.telemetry_title': 'Telemetría en Tiempo Real del Cauce',
    'dashboard.sensor_label': 'Sensor:',
    'dashboard.channel_level': 'Nivel del Cauce',
    'dashboard.alert_threshold': 'Umbral de alerta:',
    'dashboard.channel_capacity': 'Capacidad del Cauce',
    'dashboard.safety_margin': 'Margen de Seguridad',
    'dashboard.free_cm': 'cm libres',
    'dashboard.safe_hydraulic_level': '✓ Cota hidráulica segura',
    'dashboard.flow_rain': 'Caudal / Precipitación',
    'dashboard.upper_basin_rain': 'Lluvia cuenca alta:',
    'dashboard.updated_ago': 'Actualizado hace',
    'dashboard.critical_watch_segment': 'Tramo vulnerable de vigilancia:',
    'dashboard.average_velocity': 'Velocidad media:',
    'dashboard.live_siata_badge': 'En vivo · SIATA Medellín',
    'dashboard.sector_label': 'Sector:',
    'dashboard.explore_other_streams': 'Ver otras quebradas',
    'dashboard.assigned_stream_badge': 'Tu Quebrada Asignada (Residencia)',
    'dashboard.exploration_mode_badge': 'Modo Consulta / Exploración',
    'dashboard.return_to_my_stream': 'Volver a mi quebrada asignada',
    'dashboard.report_critical_segment_button': 'Reportar Novedad en Cauce',
    'dashboard.report_disabled_notice': 'Aviso de Restricción Comunitaria: Solo puedes emitir reportes comunitarios para tu zona de residencia oficial. Para reportar sobre esta cuenca, actualiza tu sector de residencia desde Mi Perfil.',
    'dashboard.report_enabled_hint': 'Como habitante de este sector, puedes registrar fotografías y reportar novedades del cauce.',
    'dashboard.orange_alert': 'Alerta Naranja',
    'dashboard.yellow_alert': 'Alerta Amarilla',
    'dashboard.safe_normal_flow': 'Caudal Seguro / Normal',

    // Cuenca Detail Modal
    'cuenca_modal.title': 'Ficha Técnica Cuenca',
    'cuenca_modal.capacity': 'Capacidad',
    'cuenca_modal.current_level': 'Nivel Actual',
    'cuenca_modal.flow_rate': 'Caudal',
    'cuenca_modal.speed': 'Velocidad',
    'cuenca_modal.description': 'Descripción Hidrográfica',
    'cuenca_modal.critical_points': 'Puntos Críticos de Monitoreo',
    'cuenca_modal.official_siata': 'Estación Oficial SIATA',
    'cuenca_modal.station_name': 'Nombre estación:',
    'cuenca_modal.rain_siata': 'Lluvia SIATA:',
    'cuenca_modal.max_elevation': 'Cota Máxima:',
    'cuenca_modal.flood_margin': 'Margen Creciente:',
    'cuenca_modal.community_status': 'Estado según reportes ciudadanos:',
    'cuenca_modal.close': 'Cerrar',
    'cuenca_modal.view_on_satellite': 'Ver en Mapa Satelital',

    // Profile Translations
    'profile.title': 'Mi Perfil',
    'profile.back': 'Volver al Monitoreo',
    'profile.admin_badge': 'Administrador',
    'profile.resident_badge': 'Habitante Residente',
    'profile.registered_since': 'Registrado desde el',
    'profile.change_name': 'Modificar nombre completo',
    'profile.save_name': 'Guardar nombre',
    'profile.cancel': 'Cancelar',
    'profile.delete_photo': 'Eliminar foto',
    'profile.scanning': 'Escaneando...',
    'profile.not_logged': 'No has iniciado sesión',
    'profile.not_logged_desc': 'Inicia sesión para ver tu perfil de habitante y gestionar tu información personal.',
    'profile.back_home': 'Volver al Inicio',

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
    'auth.email_placeholder': 'user@example.com',
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
    'reports.submit_immediate': 'Submit Immediate Report',
    'reports.submitting': 'Submitting evidence...',
    'reports.verifying': 'Verifying with AI...',
    'reports.pending_approval_notice': 'Your report has been submitted to the administrative team for verification and approval before being published to the community network.',
    'reports.admin_moderation_title': 'Report Moderation Panel (Administrator)',
    'reports.admin_moderation_desc': 'Mandatory review and verification of citizen reports prior to public display.',
    'reports.approve_action': 'Approve and Publish',
    'reports.reject_action': 'Reject / Dismiss',
    'reports.approved_badge': 'Approved & Verified',
    'reports.pending_badge': 'Pending Moderation',
    'reports.special_review_badge': 'Requires Special Review',
    'reports.forwarded_admin': 'Forwarded to overflowsoficial01@gmail.com',
    'reports.empty_title': 'No pending community reports',
    'reports.empty_desc': 'Conditions are currently calm. When residents submit reports with photos or videos, they will appear here for review.',
    'reports.level_bajo_muro': 'Below Wall (Normal)',
    'reports.level_bajo_muro_desc': 'Normal flow without apparent risk',
    'reports.level_al_puente': 'Bridge Level',
    'reports.level_al_puente_desc': 'Water touching or reaching bridge abutments',
    'reports.level_desbordada': 'Overflowing / Flash Flood',
    'reports.level_desbordada_desc': 'Water overflowing banks or roadways',
    'reports.mandatory_tag': '(MANDATORY)',
    'reports.photos_or_videos': 'Photos or Videos',
    'reports.photos_or_videos_rule': 'To ensure the accuracy of hydrological monitoring, attaching at least one photo or video of the stream is mandatory.',
    'reports.select_files_button': 'Select Photo or Video',
    'reports.attached_files_count': 'attached file(s)',
    'reports.required_badge': 'Required',
    'reports.details_label': 'Details (debris dams, branches, sediment dragging)',
    'reports.details_placeholder': 'Describe what you are observing with precision...',
    'reports.authorized_sector': 'Authorized Sector',
    'reports.locked_to_residence': 'Locked to your residence',
    'reports.validated_sector': 'Validated Sector',
    'reports.your_pending_reports': 'Your reports undergoing administrative moderation',
    'reports.your_pending_desc': 'You have submitted reports currently being reviewed by the administrator before becoming publicly visible in the community.',
    'reports.verified_reports_title': 'Approved and Verified Reports',
    'reports.verified_count': 'verified',
    'reports.report_critical_segment': 'Report Critical Segment',
    'reports.restricted_to_residence': 'Strictly restricted to your assigned residential sector',
    'reports.my_quebrada_reports_only': 'Showing verified reports for your basin:',
    'reports.all_quebradas': 'All basins (General Supervision)',
    'reports.filter_by_quebrada': 'Filter by basin',
    'reports.filter_my_basin': 'My Assigned Basin',
    'reports.filter_all': 'All Basins',
    'reports.cancel': 'Cancel',
    'reports.admin_tab_pending': 'Pending',
    'reports.admin_tab_special': 'Special Review',
    'reports.admin_tab_approved': 'Approved',
    'reports.admin_tab_all': 'All',
    'reports.admin_role_badge': 'Administrator Role',
    'reports.admin_approve_publish': 'Approve and Publish',
    'reports.admin_reject': 'Reject',
    'reports.admin_delete_title': 'Delete record',
    'reports.admin_delete_file': 'Delete file',
    'reports.admin_empty_section': 'No reports in the selected section.',
    'reports.media_label_video': 'Video',
    'reports.media_label_photo': 'Photo',
    'reports.evidence_count': 'attached evidence file(s)',
    'reports.drag_drop_hint': 'Attach stream photo or video',
    'reports.formats_hint': 'JPG, PNG, MP4 (Mandatory)',
    'reports.review_prior_notice': 'Reports undergo prior review and validation by the early warning team before becoming visible to the community.',
    'reports.empty_basin_title': 'No reports for your sector',
    'reports.empty_basin_desc': 'No issues reported at this time for your basin. You can report any changes in the riverbed as soon as you observe them.',
    'reports.ai_validating_image': 'Validating hydrological evidence with Vision AI...',
    'reports.ai_face_detected_err': 'The image contains a human face or selfie. Community reports must exclusively document the hydrological environment: stream, riverbed, debris, slopes, or affected infrastructure.',
    'reports.ai_not_hydrological_err': 'The image does not appear to capture a hydrological environment or stream. Please attach a photograph of the river, stream, slope, debris, or bridge.',
    'reports.ai_vulgar_text_err': 'Vulgar or offensive language is not allowed in community reports. Please describe stream conditions constructively and respectfully.',
    'reports.ai_ambiguous_text_notice': 'The description is ambiguous or lacks hydrological detail. The report has been recorded with status "Requires special review" and forwarded to the official administrative email (overflowsoficial01@gmail.com) for prior analysis.',
    'reports.fill_required_notes': 'Please describe the situation observed in the stream channel.',
    'reports.status_aprobado': 'Approved & Public',
    'reports.status_rechazado': 'Rejected',
    'reports.status_requiere_revision_especial': 'Requires Special Review',
    'reports.filter_my_basin': 'My Assigned Basin',
    'reports.filter_all': 'All Basins',
    'reports.exploration_mode_title': 'Exploration Mode Active',
    'reports.exploration_mode_notice': 'Exploration Mode: You can only submit reports in your official residential stream. To change your residential zone, go to My Profile.',
    'reports.btn_go_to_profile': 'Go to My Profile',
    'reports.btn_return_assigned': 'Return to My Stream',
    'reports.showing_stream_reports': 'Approved reports for basin:',
    'reports.admin_full_rights': 'Total OVERFLOWS Control: You can view, submit, and moderate reports across any basin in the system without zone restriction.',
    'map.exploration_banner': 'Exploration Mode: Viewing risk data and map for another basin. Citizen reporting is restricted to your official residential stream.',
    'map.admin_control': 'OVERFLOWS Administrator Mode: Full basin control and unrestricted reporting.',

    // Dashboard, Flow & Morphometry Translations
    'dashboard.title': 'My Stream',
    'dashboard.flow_behavior_title': 'Real-Time Flow Behavior',
    'dashboard.flow_sync_desc': 'Continuous synchronization of hydrological level during the last hour',
    'dashboard.preventive_threshold': 'Preventive Reference Level',
    'dashboard.threshold_tag': 'threshold',
    'dashboard.continuous_flow_laminar': 'Continuous Flow · Laminar',
    'dashboard.morphometry_title': 'Morphometry and Channel Characteristics',
    'dashboard.elevation_range': 'Elevation Range',
    'dashboard.channel_length': 'Channel Length',
    'dashboard.average_slope': 'Average Slope',
    'dashboard.basin_area': 'Basin Area',
    'dashboard.view_on_risk_map': 'View on Risk Map',
    'dashboard.telemetry_title': 'Real-Time Channel Telemetry',
    'dashboard.sensor_label': 'Sensor:',
    'dashboard.channel_level': 'Channel Level',
    'dashboard.alert_threshold': 'Alert threshold:',
    'dashboard.channel_capacity': 'Channel Capacity',
    'dashboard.safety_margin': 'Safety Margin',
    'dashboard.free_cm': 'free cm',
    'dashboard.safe_hydraulic_level': '✓ Safe hydraulic level',
    'dashboard.flow_rain': 'Flow Rate / Precipitation',
    'dashboard.upper_basin_rain': 'Upper basin rain:',
    'dashboard.updated_ago': 'Updated',
    'dashboard.critical_watch_segment': 'Vulnerable surveillance segment:',
    'dashboard.average_velocity': 'Average velocity:',
    'dashboard.live_siata_badge': 'Live · SIATA Medellín',
    'dashboard.sector_label': 'Sector:',
    'dashboard.explore_other_streams': 'View other streams',
    'dashboard.assigned_stream_badge': 'Your Assigned Stream (Residence)',
    'dashboard.exploration_mode_badge': 'Exploration / Query Mode',
    'dashboard.return_to_my_stream': 'Return to my assigned stream',
    'dashboard.report_critical_segment_button': 'Report Riverbed Incident',
    'dashboard.report_disabled_notice': 'Community Restriction Notice: You can only submit community reports for your official residential area. To report on this basin, update your residential sector in My Profile.',
    'dashboard.report_enabled_hint': 'As a resident of this sector, you can submit photos and report riverbed incidents.',
    'dashboard.orange_alert': 'Orange Alert',
    'dashboard.yellow_alert': 'Yellow Alert',
    'dashboard.safe_normal_flow': 'Safe / Normal Flow',

    // Cuenca Detail Modal
    'cuenca_modal.title': 'Basin Technical Sheet',
    'cuenca_modal.capacity': 'Capacity',
    'cuenca_modal.current_level': 'Current Level',
    'cuenca_modal.flow_rate': 'Flow Rate',
    'cuenca_modal.speed': 'Velocity',
    'cuenca_modal.description': 'Hydrographic Description',
    'cuenca_modal.critical_points': 'Critical Monitoring Points',
    'cuenca_modal.official_siata': 'Official SIATA Station',
    'cuenca_modal.station_name': 'Station name:',
    'cuenca_modal.rain_siata': 'SIATA Rain:',
    'cuenca_modal.max_elevation': 'Max Elevation:',
    'cuenca_modal.flood_margin': 'Flood Margin:',
    'cuenca_modal.community_status': 'Status from citizen reports:',
    'cuenca_modal.close': 'Close',
    'cuenca_modal.view_on_satellite': 'View on Satellite Map',

    // Profile Translations
    'profile.title': 'My Profile',
    'profile.back': 'Back to Monitoring',
    'profile.admin_badge': 'Administrator',
    'profile.resident_badge': 'Resident Citizen',
    'profile.registered_since': 'Registered since',
    'profile.change_name': 'Edit full name',
    'profile.save_name': 'Save name',
    'profile.cancel': 'Cancel',
    'profile.delete_photo': 'Delete photo',
    'profile.scanning': 'Scanning...',
    'profile.not_logged': 'You are not logged in',
    'profile.not_logged_desc': 'Sign in to view your resident profile and manage your personal information.',
    'profile.back_home': 'Back to Home',

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
