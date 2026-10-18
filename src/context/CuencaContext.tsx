import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { CUENCAS_LIST } from '../data/cuencasData';
import { CuencaData } from '../types';

export interface CuencaContextType {
  assignedCuencaId: string;
  selectedCuencaId: string;
  setSelectedCuencaId: (id: string) => void;
  assignedCuenca: CuencaData;
  activeCuenca: CuencaData;
  isExploring: boolean;
  isAdmin: boolean;
  canSubmitReports: boolean;
  resetToAssigned: () => void;
  deriveUserCuenca: (sector?: string) => string;
}

export const deriveUserCuenca = (sector?: string): string => {
  if (!sector) return 'altavista';
  const s = sector.toLowerCase();
  if (
    s.includes('aguas frías') ||
    s.includes('aguas frias') ||
    s.includes('morro plan') ||
    s.includes('picacha') ||
    s.includes('brisas') ||
    s.includes('altos del castillo')
  ) {
    return 'la-picacha';
  }
  if (s.includes('esperanza') || s.includes('chispero') || s.includes('cañada')) {
    return 'la-canada';
  }
  if (
    s.includes('morro') ||
    s.includes('corazón') ||
    s.includes('corazon') ||
    s.includes('buenavista') ||
    s.includes('san judas') ||
    s.includes('ladrillera') ||
    s.includes('amaya')
  ) {
    return 'buenavista';
  }
  if (
    s.includes('manzanillo') ||
    s.includes('jardín') ||
    s.includes('jardin') ||
    s.includes('guayabala') ||
    s.includes('camelias') ||
    s.includes('rodeo')
  ) {
    return 'la-guayabala';
  }
  if (
    s.includes('buga') ||
    s.includes('patio bonito') ||
    s.includes('san pablo') ||
    s.includes('central') ||
    s.includes('altavista')
  ) {
    return 'altavista';
  }
  return 'altavista';
};

const CuencaContext = createContext<CuencaContextType | undefined>(undefined);

export const CuencaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const isAdmin =
    currentUser?.role === 'administrador' ||
    currentUser?.email === 'overflowsoficial01@gmail.com';

  const assignedCuencaId = useMemo(() => {
    return deriveUserCuenca(currentUser?.barrioSector);
  }, [currentUser?.barrioSector]);

  // Selected cuenca being currently explored or viewed across all views
  const [selectedCuencaId, setSelectedCuencaId] = useState<string>(assignedCuencaId);

  // When user logs in, logs out, or switches accounts/sectors, always initialize back to assigned residential cuenca
  useEffect(() => {
    setSelectedCuencaId(assignedCuencaId);
  }, [assignedCuencaId, currentUser?.id]);

  // Exploring mode is strictly for non-admin citizens viewing a cuenca different from their residence
  const isExploring = !isAdmin && selectedCuencaId !== assignedCuencaId;

  // Active cuenca object
  const activeCuenca = useMemo(() => {
    return (
      CUENCAS_LIST.find((c) => c.id === selectedCuencaId) ||
      CUENCAS_LIST.find((c) => c.id === assignedCuencaId) ||
      CUENCAS_LIST[0]
    );
  }, [selectedCuencaId, assignedCuencaId]);

  // Assigned residence cuenca object
  const assignedCuenca = useMemo(() => {
    return CUENCAS_LIST.find((c) => c.id === assignedCuencaId) || CUENCAS_LIST[0];
  }, [assignedCuencaId]);

  // Permitted to submit report: Administrator has unrestricted access across all cuencas.
  // Citizens can only submit reports if viewing their assigned residence cuenca.
  const canSubmitReports = isAdmin || !isExploring;

  const resetToAssigned = () => {
    setSelectedCuencaId(assignedCuencaId);
  };

  return (
    <CuencaContext.Provider
      value={{
        assignedCuencaId,
        selectedCuencaId,
        setSelectedCuencaId,
        assignedCuenca,
        activeCuenca,
        isExploring,
        isAdmin,
        canSubmitReports,
        resetToAssigned,
        deriveUserCuenca
      }}
    >
      {children}
    </CuencaContext.Provider>
  );
};

export const useCuenca = (): CuencaContextType => {
  const context = useContext(CuencaContext);
  if (!context) {
    throw new Error('useCuenca must be used within a CuencaProvider');
  }
  return context;
};
