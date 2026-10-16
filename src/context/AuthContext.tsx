import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  barrioSector: string;
  dataTreatmentAccepted: boolean;
  role?: UserRole;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  usersRegistry: UserAccount[];
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  loginWithGoogle: (emailHint?: string, nameHint?: string) => Promise<{ success: boolean; user?: UserAccount; error?: string }>;
  register: (payload: RegisterPayload) => { success: boolean; error?: string };
  logout: () => void;
  checkUserExists: (identifier: string) => { exists: boolean; maskedIdentifier?: string };
  resetPassword: (identifier: string, newPassword: string) => { success: boolean; error?: string };
  verifyCurrentUserPassword: (password: string) => boolean;
  deleteAccount: (userId: string, passwordConfirm?: string) => { success: boolean; message: string; error?: string };
  updateUserContact: (
    userId: string,
    updates: { email?: string; phone?: string }
  ) => { success: boolean; message: string; error?: string };
  toggleUserRole: (userId: string) => void;
}

const STORAGE_USERS_KEY = 'overflows_altavista_users_v4';
const STORAGE_CURRENT_USER_KEY = 'overflows_altavista_current_user_v4';

const DEFAULT_USERS: (UserAccount & { passwordHash: string })[] = [
  {
    id: 'user-001',
    name: 'Don Hernando Ruiz',
    email: 'h.ruiz@overflowsaltavista.org',
    phone: '3124567890',
    barrioSector: 'Vereda San Pablo (Calle 18)',
    createdAt: '2026-08-15T08:00:00Z',
    dataTreatmentAccepted: true,
    passwordHash: '123456',
    role: 'habitante'
  },
  {
    id: 'user-002',
    name: 'Mariana Sandoval Díaz',
    email: 'sandovaldiazmariana23@gmail.com',
    phone: '3002407070',
    barrioSector: 'Sector Morro Plan',
    createdAt: '2026-09-01T10:00:00Z',
    dataTreatmentAccepted: true,
    passwordHash: 'admin2026',
    role: 'administrador'
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
        error: 'Debes autorizar el tratamiento de datos personales conforme a la Ley 1581 de 2012 para registrarte.'
      };
    }

    // Check if account already exists by Email or Phone
    const existingByEmail = usersRegistry.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );
    if (existingByEmail) {
      return {
        success: false,
        error: `Ya existe una cuenta registrada con el correo "${trimmedEmail}". Por favor inicia sesión.`
      };
    }

    const existingByPhone = usersRegistry.find(
      (u) => normalizePhone(u.phone) === cleanPhone
    );
    if (existingByPhone) {
      return {
        success: false,
        error: `Ya existe una cuenta registrada con el número telefónico "${payload.phone}". Por favor inicia sesión.`
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
      passwordHash: payload.password,
      role: payload.role || 'habitante'
    };

    setUsersRegistry((prev) => [...prev, newUser]);
    const { passwordHash, ...safeUser } = newUser;
    setCurrentUser(safeUser);

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
    return { success: true };
  };

  // Google Sign-In or Registration Flow
  const loginWithGoogle = async (
    emailHint?: string,
    nameHint?: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> => {
    try {
      const email = emailHint?.trim().toLowerCase() || 'kevinmatiashiguitagarcia@gmail.com';
      const name = nameHint?.trim() || 'Kevin Matías Higüita García';

      // Check if user already exists
      let user = usersRegistry.find((u) => u.email.toLowerCase() === email);

      if (!user) {
        // Automatically create account for Google user with confirmed data policy
        const newUser: UserAccount & { passwordHash: string } = {
          id: `user-google-${Date.now()}`,
          name: name,
          email: email,
          phone: '310' + Math.floor(1000000 + Math.random() * 9000000),
          barrioSector: 'Vereda Aguas Frías',
          createdAt: new Date().toISOString(),
          dataTreatmentAccepted: true,
          passwordHash: `google-auth-${Date.now()}`,
          role: 'habitante'
        };

        setUsersRegistry((prev) => [...prev, newUser]);
        user = newUser;
      }

      const { passwordHash, ...safeUser } = user;
      setCurrentUser(safeUser);
      return { success: true, user: safeUser };
    } catch {
      return {
        success: false,
        error: 'No fue posible completar la autenticación con Google. Intenta nuevamente.'
      };
    }
  };

  // Check if an identifier exists for password recovery
  const checkUserExists = (identifier: string): { exists: boolean; maskedIdentifier?: string } => {
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
      return { exists: false };
    }

    // Mask identifier for security
    let masked = matchedUser.email;
    if (isLikelyEmail) {
      const parts = matchedUser.email.split('@');
      const prefix = parts[0];
      const domain = parts[1] || '';
      masked = `${prefix.substring(0, 2)}***@${domain}`;
    } else {
      const phone = matchedUser.phone;
      masked = `***-***-${phone.slice(-4)}`;
    }

    return { exists: true, maskedIdentifier: masked };
  };

  // Reset password implementation
  const resetPassword = (identifier: string, newPassword: string): { success: boolean; error?: string } => {
    const rawTrimmed = identifier.trim();
    const cleanIdPhone = normalizePhone(rawTrimmed);
    const isLikelyEmail = rawTrimmed.includes('@');

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }

    const index = usersRegistry.findIndex((u) => {
      if (isLikelyEmail) {
        return u.email.toLowerCase() === rawTrimmed.toLowerCase();
      }
      const uPhone = normalizePhone(u.phone);
      return (
        (cleanIdPhone.length >= 7 && uPhone === cleanIdPhone) ||
        u.email.toLowerCase() === rawTrimmed.toLowerCase()
      );
    });

    if (index === -1) {
      return { success: false, error: 'No se encontró la cuenta para restablecer la contraseña.' };
    }

    const updatedUsers = [...usersRegistry];
    updatedUsers[index] = {
      ...updatedUsers[index],
      passwordHash: newPassword
    };

    setUsersRegistry(updatedUsers);

    // If current logged in user is the same, update
    if (currentUser && currentUser.id === updatedUsers[index].id) {
      const { passwordHash, ...safe } = updatedUsers[index];
      setCurrentUser(safe);
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const verifyCurrentUserPassword = (password: string): boolean => {
    if (!currentUser) return false;
    const user = usersRegistry.find((u) => u.id === currentUser.id);
    if (!user || !user.passwordHash) return false;
    return user.passwordHash === password;
  };

  const deleteAccount = (userId: string, passwordConfirm?: string): { success: boolean; message: string; error?: string } => {
    const userToDelete = usersRegistry.find((u) => u.id === userId);
    if (!userToDelete) {
      return { success: false, message: 'La cuenta no fue encontrada en los registros.', error: 'Usuario no encontrado' };
    }

    if (passwordConfirm && userToDelete.passwordHash && userToDelete.passwordHash !== passwordConfirm) {
      return { success: false, message: 'La contraseña no coincide.', error: 'Contraseña incorrecta' };
    }

    setUsersRegistry((prev) => prev.filter((u) => u.id !== userId));

    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }

    return {
      success: true,
      message: `La cuenta de ${userToDelete.name} ha sido eliminada permanentemente del sistema con supresión de datos.`
    };
  };

  const updateUserContact = (
    userId: string,
    updates: { email?: string; phone?: string }
  ): { success: boolean; message: string; error?: string } => {
    const userIndex = usersRegistry.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado.', error: 'Usuario no encontrado' };
    }

    const currentRecord = usersRegistry[userIndex];
    let newEmail = currentRecord.email;
    let newPhone = currentRecord.phone;

    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase();
      if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
        return { success: false, message: 'Correo electrónico inválido.', error: 'Formato de correo no válido' };
      }
      const existingEmail = usersRegistry.find(
        (u) => u.id !== userId && u.email.toLowerCase() === cleanEmail
      );
      if (existingEmail) {
        return {
          success: false,
          message: 'Este correo electrónico ya está en uso por otra cuenta.',
          error: 'Correo duplicado'
        };
      }
      newEmail = cleanEmail;
    }

    if (updates.phone) {
      const cleanPhone = normalizePhone(updates.phone);
      if (cleanPhone.length < 7) {
        return {
          success: false,
          message: 'Número de celular o teléfono inválido.',
          error: 'Formato de celular no válido'
        };
      }
      const existingPhone = usersRegistry.find(
        (u) => u.id !== userId && normalizePhone(u.phone) === cleanPhone
      );
      if (existingPhone) {
        return {
          success: false,
          message: 'Este número de teléfono ya está en uso por otra cuenta.',
          error: 'Teléfono duplicado'
        };
      }
      newPhone = cleanPhone;
    }

    const updatedUser = {
      ...currentRecord,
      email: newEmail,
      phone: newPhone
    };

    const updatedList = [...usersRegistry];
    updatedList[userIndex] = updatedUser;
    setUsersRegistry(updatedList);

    if (currentUser?.id === userId) {
      const { passwordHash, ...safeUser } = updatedUser;
      setCurrentUser(safeUser);
    }

    return {
      success: true,
      message: 'Información de contacto actualizada correctamente.'
    };
  };

  const toggleUserRole = (userId: string) => {
    setUsersRegistry((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRole: UserRole = u.role === 'administrador' ? 'habitante' : 'administrador';
          return { ...u, role: newRole };
        }
        return u;
      })
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => {
        if (!prev) return null;
        const newRole: UserRole = prev.role === 'administrador' ? 'habitante' : 'administrador';
        return { ...prev, role: newRole };
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersRegistry,
        login,
        loginWithGoogle,
        register,
        logout,
        checkUserExists,
        resetPassword,
        verifyCurrentUserPassword,
        deleteAccount,
        updateUserContact,
        toggleUserRole
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
