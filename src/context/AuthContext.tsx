import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount } from '../types';

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  barrioSector: string;
  dataTreatmentAccepted: boolean;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  usersRegistry: UserAccount[];
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  register: (payload: RegisterPayload) => { success: boolean; error?: string };
  logout: () => void;
  deleteAccount: (userId: string) => { success: boolean; message: string };
  continueAsGuest: () => void;
  isGuest: boolean;
}

const STORAGE_USERS_KEY = 'overflows_altavista_users_v3';
const STORAGE_CURRENT_USER_KEY = 'overflows_altavista_current_user_v3';

// Seed initial users for convenience and demonstration
const DEFAULT_USERS: (UserAccount & { passwordHash: string })[] = [
  {
    id: 'user-001',
    name: 'Don Hernando Ruiz',
    email: 'h.ruiz@overflowsaltavista.org',
    phone: '3124567890',
    barrioSector: 'Sector San Pablo',
    createdAt: '2026-08-15T08:00:00Z',
    dataTreatmentAccepted: true,
    passwordHash: '123456'
  },
  {
    id: 'user-002',
    name: 'Mariana Sandoval Díaz',
    email: 'sandovaldiazmariana23@gmail.com',
    phone: '3002407070',
    barrioSector: 'Sector Morro Plan',
    createdAt: '2026-09-01T10:00:00Z',
    dataTreatmentAccepted: true,
    passwordHash: 'admin2026'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersRegistry, setUsersRegistry] = useState<(UserAccount & { passwordHash?: string })[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(usersRegistry));
    } catch (e) {
      console.error('Error saving users to localStorage', e);
    }
  }, [usersRegistry]);

  // Sync current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Error saving current user to localStorage', e);
    }
  }, [currentUser]);

  const normalizePhone = (num: string) => num.replace(/\D/g, '').trim();

  const register = (payload: RegisterPayload): { success: boolean; error?: string } => {
    const trimmedEmail = payload.email.trim().toLowerCase();
    const cleanPhone = normalizePhone(payload.phone);

    if (!payload.name.trim()) {
      return { success: false, error: 'Por favor ingresa tu nombre completo.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Por favor ingresa un correo electrónico válido.' };
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      return { success: false, error: 'Por favor ingresa un número de teléfono o celular válido (mínimo 7 dígitos).' };
    }
    if (!payload.password || payload.password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    if (!payload.dataTreatmentAccepted) {
      return {
        success: false,
        error: 'Debes autorizar el tratamiento de datos personales conforme a la política y normativa digital vigente para registrarte.'
      };
    }

    // Check if account already exists by Email or Phone
    const existingByEmail = usersRegistry.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );
    if (existingByEmail) {
      return {
        success: false,
        error: `Ya existe una cuenta registrada con el correo "${trimmedEmail}". No se puede volver a crear. Por favor inicia sesión.`
      };
    }

    const existingByPhone = usersRegistry.find(
      (u) => normalizePhone(u.phone) === cleanPhone
    );
    if (existingByPhone) {
      return {
        success: false,
        error: `Ya existe una cuenta registrada con el número telefónico "${payload.phone}". No se puede volver a crear. Por favor inicia sesión.`
      };
    }

    const newUser: UserAccount & { passwordHash: string } = {
      id: `user-${Date.now()}`,
      name: payload.name.trim(),
      email: trimmedEmail,
      phone: cleanPhone,
      barrioSector: payload.barrioSector || 'Sector Morro Plan',
      createdAt: new Date().toISOString(),
      dataTreatmentAccepted: true,
      passwordHash: payload.password
    };

    setUsersRegistry((prev) => [...prev, newUser]);
    const { passwordHash, ...safeUser } = newUser;
    setCurrentUser(safeUser);
    setIsGuest(false);

    return { success: true };
  };

  const login = (
    identifier: string,
    password: string
  ): { success: boolean; error?: string } => {
    const rawTrimmed = identifier.trim();
    const cleanIdPhone = normalizePhone(rawTrimmed);
    const isLikelyEmail = rawTrimmed.includes('@');

    const matchedUser = usersRegistry.find((u) => {
      if (isLikelyEmail) {
        return u.email.toLowerCase() === rawTrimmed.toLowerCase();
      }
      const uPhone = normalizePhone(u.phone);
      return (
        (cleanIdPhone.length >= 7 && uPhone === cleanIdPhone) ||
        u.email.toLowerCase() === rawTrimmed.toLowerCase()
      );
    });

    if (!matchedUser) {
      return {
        success: false,
        error: 'No se encontró ninguna cuenta asociada a este correo o número telefónico. Por favor verifica tus datos o crea una cuenta.'
      };
    }

    // Verify password
    if (matchedUser.passwordHash && matchedUser.passwordHash !== password) {
      return {
        success: false,
        error: 'Contraseña incorrecta. Por favor intenta de nuevo.'
      };
    }

    const { passwordHash, ...safeUser } = matchedUser;
    setCurrentUser(safeUser);
    setIsGuest(false);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsGuest(false);
  };

  const deleteAccount = (userId: string): { success: boolean; message: string } => {
    const userToDelete = usersRegistry.find((u) => u.id === userId);
    if (!userToDelete) {
      return { success: false, message: 'La cuenta no fue encontrada en los registros.' };
    }

    setUsersRegistry((prev) => prev.filter((u) => u.id !== userId));

    if (currentUser?.id === userId) {
      setCurrentUser(null);
      setIsGuest(false);
    }

    return {
      success: true,
      message: `La cuenta de ${userToDelete.name} ha sido eliminada permanentemente del sistema con supresión de datos.`
    };
  };

  const continueAsGuest = () => {
    setCurrentUser(null);
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersRegistry,
        login,
        register,
        logout,
        deleteAccount,
        continueAsGuest,
        isGuest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

