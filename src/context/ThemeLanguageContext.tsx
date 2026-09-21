import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'es' | 'en';

interface ThemeLanguageContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;
}

const STORAGE_THEME_KEY = 'overflows_altavista_theme';
const STORAGE_LANG_KEY = 'overflows_altavista_language';

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  es: {
    'app.title': 'Overflows Altavista',
    'app.subtitle': 'Sistema Comunitario de Alerta Temprana · Comuna 70',
    'nav.dashboard': 'Mi Quebrada',
    'nav.dashboard_admin': 'Supervisión General',
    'nav.map': 'Mapa de Riesgo en Vivo',
    'nav.reports': 'Reportes Ciudadanos',
    'nav.settings': 'Configuración',
    'nav.profile': 'Mi Perfil',
    'nav.logout': 'Cerrar sesión',
    'nav.delete_account': 'Eliminar cuenta',
    'status.normal': 'Normalidad Hidrológica',
    'status.normal_desc': 'Cauces despejados con flujo seguro dentro de los límites normales.',
    'status.synchronized': 'Sincronizado en tiempo real con red hidrológica metropolitana',
    'settings.theme': 'Modo de Visualización',
    'settings.theme_desc': 'Elige entre tema claro y tema oscuro para el panel',
    'settings.theme_light': 'Modo Claro',
    'settings.theme_dark': 'Modo Oscuro',
    'settings.language': 'Idioma del Sistema',
    'settings.language_desc': 'Selecciona el idioma de la interfaz',
    'reports.title': 'Reportes Ciudadanos con Evidencia',
    'reports.require_media': 'Es obligatorio adjuntar foto o video del cauce',
    'reports.restricted_zone': 'Reporte restringido estrictamente a tu sector de residencia'
  },
  en: {
    'app.title': 'Overflows Altavista',
    'app.subtitle': 'Community Early Warning System · Comuna 70',
    'nav.dashboard': 'My Stream',
    'nav.dashboard_admin': 'General Supervision',
    'nav.map': 'Live Risk Map',
    'nav.reports': 'Citizen Reports',
    'nav.settings': 'Settings',
    'nav.profile': 'My Profile',
    'nav.logout': 'Log out',
    'nav.delete_account': 'Delete account',
    'status.normal': 'Hydrological Normality',
    'status.normal_desc': 'Streams clear with safe flow within normal limits.',
    'status.synchronized': 'Synchronized in real time with metropolitan hydrological network',
    'settings.theme': 'Display Mode',
    'settings.theme_desc': 'Choose between light and dark theme for the interface',
    'settings.theme_light': 'Light Mode',
    'settings.theme_dark': 'Dark Mode',
    'settings.language': 'System Language',
    'settings.language_desc': 'Select interface language',
    'reports.title': 'Citizen Reports with Evidence',
    'reports.require_media': 'Attaching a photo or video of the stream is mandatory',
    'reports.restricted_zone': 'Report strictly restricted to your residential sector'
  }
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
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

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['es']?.[key] || key;
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
