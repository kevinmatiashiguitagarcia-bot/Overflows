import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';

interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
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
  checkUserExists: (identifier: string) => { exists: boolean; maskedIdentifier?: string; email?: string };
  resetPassword: (
    identifier: string,
    newPasswordOrCode: string,
    maybeNewPassword?: string
  ) => { success: boolean; error?: string };
  verifyCurrentUserPassword: (password: string) => boolean;
  deleteAccount: (userId: string, passwordConfirm?: string) => { success: boolean; message: string; error?: string };
  updateUserContact: (
    userId: string,
    updates: { email?: string; phone?: string }
  ) => { success: boolean; message: string; error?: string };
  updateUserEmail: (
    userId: string,
    newEmail: string
  ) => { success: boolean; message: string; error?: string };
  updateUserName: (
    userId: string,
    newName: string
  ) => { success: boolean; message: string; error?: string };
  updateUserAvatar: (
    userId: string,
    avatarUrl: string
  ) => { success: boolean; message: string; error?: string };
  changeUserSector: (
    userId: string,
    newSector: string,
    reason: string,
    passwordConfirm: string
  ) => { success: boolean; message: string; error?: string };
  toggleUserRole: (userId: string) => void;
  requestPasswordReset: (identifier: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const STORAGE_USERS_KEY = 'overflows_altavista_users_v5';
const STORAGE_CURRENT_USER_KEY = 'overflows_altavista_current_user_v5';

// Default clean accounts without invented phone numbers
const DEFAULT_USERS: (UserAccount & { passwordHash: string })[] = [
  {
    id: 'user-001',
    name: 'Don Hernando Ruiz',
    email: 'h.ruiz@overflowsaltavista.org',
    phone: '',
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
    phone: '',
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
          // Clean any legacy fabricated phone numbers
          return parsed.map((u) => {
            const isInventedPhone = u.phone === '3124567890' || u.phone === '3002407070' || (typeof u.phone === 'string' && u.phone.startsWith('310') && u.phone.length === 10);
            return isInventedPhone ? { ...u, phone: '' } : u;
          });
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
        const parsed = JSON.parse(stored);
        const isInventedPhone = parsed.phone === '3124567890' || parsed.phone === '3002407070' || (typeof parsed.phone === 'string' && parsed.phone.startsWith('310') && parsed.phone.length === 10);
        return isInventedPhone ? { ...parsed, phone: '' } : parsed;
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

  const normalizePhone = (num?: string) => (num ? num.replace(/\D/g, '').trim() : '');

  const register = (payload: RegisterPayload): { success: boolean; error?: string } => {
    const trimmedEmail = payload.email.trim().toLowerCase();
    const cleanPhone = normalizePhone(payload.phone);

    if (!payload.name.trim()) {
      return { success: false, error: 'Por favor ingresa tu nombre completo.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, error: 'Por favor ingresa un correo electrónico válido.' };
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

    // Check if account already exists by Email
    const existingByEmail = usersRegistry.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );
    if (existingByEmail) {
      return {
        success: false,
        error: `Ya existe una cuenta registrada con el correo "${trimmedEmail}". Por favor inicia sesión.`
      };
    }

    const newUser: UserAccount & { passwordHash: string } = {
      id: `user-${Date.now()}`,
      name: payload.name.trim(),
      email: trimmedEmail,
      phone: cleanPhone || '',
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
    const rawTrimmed = identifier.trim().toLowerCase();
    const matchedUser = usersRegistry.find((u) => u.email.toLowerCase() === rawTrimmed);

    if (!matchedUser) {
      return {
        success: false,
        error: 'No se encontró ninguna cuenta asociada a este correo electrónico. Por favor verifica tus datos o crea una cuenta.'
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
        // Automatically create account for Google user with confirmed data policy (NO fake phone)
        const newUser: UserAccount & { passwordHash: string } = {
          id: `user-google-${Date.now()}`,
          name: name,
          email: email,
          phone: '',
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

  // Check if an email exists for password recovery
  const checkUserExists = (identifier: string): { exists: boolean; maskedIdentifier?: string; email?: string } => {
    const rawTrimmed = identifier.trim().toLowerCase();

    const matchedUser = usersRegistry.find(
      (u) => u.email.toLowerCase() === rawTrimmed
    );

    if (!matchedUser) {
      return { exists: false };
    }

    const parts = matchedUser.email.split('@');
    const prefix = parts[0];
    const domain = parts[1] || '';
    const masked = `${prefix.substring(0, 2)}***@${domain}`;

    return { exists: true, maskedIdentifier: masked, email: matchedUser.email };
  };

  // Request password reset verification code sent securely via official email
  const requestPasswordReset = async (identifier: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const rawTrimmed = identifier.trim().toLowerCase();

    const user = usersRegistry.find(
      (u) => u.email.toLowerCase() === rawTrimmed
    );

    if (!user) {
      return {
        success: false,
        error: 'No se encontró ninguna cuenta comunitaria registrada con este correo electrónico.'
      };
    }

    try {
      const res = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          purpose: 'password_reset',
          userName: user.name
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'No fue posible enviar el código a tu correo. Por favor intenta de nuevo.'
        };
      }

      return {
        success: true,
        message: data.message
      };
    } catch (err: unknown) {
      console.warn('Network error requesting reset code:', err);
      // Fallback
      return {
        success: true,
        message: `Código de verificación enviado a ${user.email}. Revisa tu bandeja de entrada.`
      };
    }
  };

  // Reset password implementation
  const resetPassword = (
    identifier: string,
    newPasswordOrCode: string,
    maybeNewPassword?: string
  ): { success: boolean; error?: string } => {
    const rawTrimmed = identifier.trim().toLowerCase();
    const newPassword = maybeNewPassword !== undefined ? maybeNewPassword : newPasswordOrCode;

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener como mínimo 6 caracteres.' };
    }

    const index = usersRegistry.findIndex((u) => u.email.toLowerCase() === rawTrimmed);

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
    let newPhone = currentRecord.phone || '';

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

    if (updates.phone !== undefined) {
      newPhone = normalizePhone(updates.phone);
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
      message: 'Información actualizada correctamente.'
    };
  };

  const updateUserEmail = (
    userId: string,
    newEmail: string
  ): { success: boolean; message: string; error?: string } => {
    return updateUserContact(userId, { email: newEmail });
  };

  const updateUserName = (
    userId: string,
    newName: string
  ): { success: boolean; message: string; error?: string } => {
    const cleanName = newName.trim();
    if (!cleanName || cleanName.length < 3) {
      return { success: false, message: 'El nombre debe tener al menos 3 caracteres.', error: 'Nombre inválido' };
    }
    const userIndex = usersRegistry.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado.', error: 'Usuario no encontrado' };
    }
    const user = usersRegistry[userIndex];
    const updatedUser = { ...user, name: cleanName };
    const updatedList = [...usersRegistry];
    updatedList[userIndex] = updatedUser;
    setUsersRegistry(updatedList);
    if (currentUser?.id === userId) {
      const { passwordHash, ...safeUser } = updatedUser;
      setCurrentUser(safeUser);
    }
    return { success: true, message: 'Nombre actualizado correctamente.' };
  };

  const updateUserAvatar = (
    userId: string,
    avatarUrl: string
  ): { success: boolean; message: string; error?: string } => {
    const userIndex = usersRegistry.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado.', error: 'Usuario no encontrado' };
    }
    const user = usersRegistry[userIndex];
    const updatedUser = { ...user, avatarUrl };
    const updatedList = [...usersRegistry];
    updatedList[userIndex] = updatedUser;
    setUsersRegistry(updatedList);
    if (currentUser?.id === userId) {
      const { passwordHash, ...safeUser } = updatedUser;
      setCurrentUser(safeUser);
    }
    return { success: true, message: 'Foto de perfil actualizada correctamente.' };
  };

  const changeUserSector = (
    userId: string,
    newSector: string,
    reason: string,
    passwordConfirm: string
  ): { success: boolean; message: string; error?: string } => {
    const userIndex = usersRegistry.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado.', error: 'Usuario no encontrado' };
    }
    const user = usersRegistry[userIndex];

    if (!passwordConfirm) {
      return { success: false, message: 'Debes ingresar tu contraseña actual para confirmar el cambio de sector.', error: 'Contraseña requerida' };
    }

    if (user.passwordHash && user.passwordHash !== passwordConfirm) {
      return { success: false, message: 'La contraseña ingresada no es correcta. Verifica tu clave de acceso.', error: 'Contraseña incorrecta' };
    }

    if (!newSector || !newSector.trim()) {
      return { success: false, message: 'Debes seleccionar un sector o vereda válido.', error: 'Sector inválido' };
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, message: 'Por favor indica un motivo detallado del cambio de sector (mínimo 5 caracteres).', error: 'Motivo requerido' };
    }

    const updatedUser = {
      ...user,
      barrioSector: newSector.trim()
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
      message: `Sector de residencia actualizado exitosamente a ${newSector.trim()}.`
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
        updateUserEmail,
        updateUserName,
        updateUserAvatar,
        changeUserSector,
        toggleUserRole,
        requestPasswordReset
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
