import { createContext, useContext, useState, type ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  mfaVerified: boolean;
  lastLogin: string;
  rememberMe: boolean;
}

export interface PendingVerification {
  email: string;
  name?: string;
  code: string;
  redirect?: string;
  timestamp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  pendingAuth: PendingVerification | null;
  login: (userData?: Partial<UserProfile>, remember?: boolean) => void;
  logout: () => void;
  setPendingVerification: (data: PendingVerification) => void;
  verifyOtp: (inputCode: string) => boolean;
  resendOtp: () => string;
}

const DEFAULT_USER: UserProfile = {
  name: 'Chittlu Sai',
  email: 'chittlusai@gmail.com',
  role: 'Cybersecurity Analyst (Lead)',
  mfaVerified: true,
  lastLogin: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  rememberMe: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. Initialise authentication state from localStorage for browser refresh persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_token') === 'true';
  });

  // 2. Initialise user profile from localStorage
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('phishguard_auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return DEFAULT_USER;
      }
    }
    return localStorage.getItem('auth_token') === 'true' ? DEFAULT_USER : null;
  });

  // 3. Initialise pending verification from sessionStorage
  const [pendingAuth, setPendingAuthState] = useState<PendingVerification | null>(() => {
    const savedPending = sessionStorage.getItem('phishguard_pending_auth');
    if (savedPending) {
      try {
        return JSON.parse(savedPending);
      } catch {
        return null;
      }
    }
    return null;
  });

  const setPendingVerification = (data: PendingVerification) => {
    setPendingAuthState(data);
    sessionStorage.setItem('phishguard_pending_auth', JSON.stringify(data));
  };

  const login = (userData?: Partial<UserProfile>, remember = true) => {
    const newUser: UserProfile = {
      name: userData?.name || user?.name || DEFAULT_USER.name,
      email: userData?.email || user?.email || DEFAULT_USER.email,
      role: userData?.role || 'Cybersecurity Analyst (Lead)',
      mfaVerified: true,
      lastLogin: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      rememberMe: remember,
    };

    setIsAuthenticated(true);
    setUser(newUser);
    localStorage.setItem('auth_token', 'true');
    localStorage.setItem('phishguard_auth_user', JSON.stringify(newUser));
    sessionStorage.removeItem('phishguard_pending_auth');
    setPendingAuthState(null);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setPendingAuthState(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('phishguard_auth_user');
    sessionStorage.removeItem('phishguard_pending_auth');
  };

  const verifyOtp = (inputCode: string): boolean => {
    const cleanInput = inputCode.trim();
    // Allow either the pending session code or universal mock bypass 849201 for easy testing
    const targetCode = pendingAuth?.code || '849201';
    if (cleanInput === targetCode || cleanInput === '849201') {
      login({
        name: pendingAuth?.name || (pendingAuth?.email ? pendingAuth.email.split('@')[0] : DEFAULT_USER.name),
        email: pendingAuth?.email || DEFAULT_USER.email,
        mfaVerified: true,
      });
      return true;
    }
    return false;
  };

  const resendOtp = (): string => {
    // Generate random 6-digit numeric OTP code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const updated: PendingVerification = {
      email: pendingAuth?.email || DEFAULT_USER.email,
      name: pendingAuth?.name,
      code: newCode,
      redirect: pendingAuth?.redirect,
      timestamp: Date.now(),
    };
    setPendingVerification(updated);
    return newCode;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        pendingAuth,
        login,
        logout,
        setPendingVerification,
        verifyOtp,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
