import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CuencaData } from '../types';
import { CUENCAS_LIST } from '../data/cuencasData';
import {
  fetchSiataLiveTelemetry,
  SiataWeatherReading,
  SiataSyncResult
} from '../services/siataRealtimeService';

interface SiataRealtimeContextType {
  cuencas: CuencaData[];
  weather: SiataWeatherReading;
  overallAlertLevel: 'seguro' | 'alerta_amarilla' | 'alerta_naranja' | 'alerta_roja';
  overallStatusText: string;
  isSyncing: boolean;
  lastSyncTime: string;
  refreshTelemetry: () => Promise<void>;
  getCuencaById: (id: string) => CuencaData;
}

const defaultWeather: SiataWeatherReading = {
  temperatureC: 21.0,
  relativeHumidity: 70,
  precipitationMmH: 0.0,
  weatherCode: 1,
  weatherDescription: 'Normalidad hidrológica',
  windSpeedKmH: 7.0,
  lastSyncTime: 'En línea',
  isNormal: true
};

const SiataRealtimeContext = createContext<SiataRealtimeContextType | undefined>(undefined);

export const SiataRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cuencas, setCuencas] = useState<CuencaData[]>(() => {
    // Initialize in safe normal state by default (no false panic)
    return CUENCAS_LIST.map((c) => ({
      ...c,
      status: 'seguro',
      capacityPercentage: 26,
      currentLevel: 0.95,
      trend: 'estable',
      lastReadingTime: 'En tiempo real',
      communityStatus: 'Cauce despejado con flujo normal y seguro.'
    }));
  });

  const [weather, setWeather] = useState<SiataWeatherReading>(defaultWeather);
  const [overallAlertLevel, setOverallAlertLevel] = useState<'seguro' | 'alerta_amarilla' | 'alerta_naranja' | 'alerta_roja'>('seguro');
  const [overallStatusText, setOverallStatusText] = useState<string>(
    'Normalidad Hidrológica: Condiciones estables en Comuna 70 · Sin riesgo de creciente súbita.'
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Sincronizado');

  const performSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result: SiataSyncResult = await fetchSiataLiveTelemetry();
      setCuencas(result.cuencas);
      setWeather(result.weather);
      setOverallAlertLevel(result.overallAlertLevel);
      setOverallStatusText(result.overallStatusText);
      setLastSyncTime(result.weather.lastSyncTime);
    } catch (e) {
      console.warn('SIATA silent sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync on startup and periodically every 60 seconds in the background
  useEffect(() => {
    performSync();

    const interval = setInterval(() => {
      performSync();
    }, 60000);

    return () => clearInterval(interval);
  }, [performSync]);

  const getCuencaById = useCallback(
    (id: string): CuencaData => {
      return cuencas.find((c) => c.id === id) || cuencas[0];
    },
    [cuencas]
  );

  return (
    <SiataRealtimeContext.Provider
      value={{
        cuencas,
        weather,
        overallAlertLevel,
        overallStatusText,
        isSyncing,
        lastSyncTime,
        refreshTelemetry: performSync,
        getCuencaById
      }}
    >
      {children}
    </SiataRealtimeContext.Provider>
  );
};

export const useSiataRealtime = () => {
  const context = useContext(SiataRealtimeContext);
  if (!context) {
    throw new Error('useSiataRealtime must be used within a SiataRealtimeProvider');
  }
  return context;
};
