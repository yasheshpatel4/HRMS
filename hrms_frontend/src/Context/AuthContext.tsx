import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'MySecretKey12345'; 

const encryptPassword = (password: string): string => {
  const encrypted = CryptoJS.AES.encrypt(password, CryptoJS.enc.Utf8.parse(SECRET_KEY), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
};

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  managerId?: number;
}

interface AuthContextType {
  user: User | null;
  role: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (formData: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('invalid use');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const role = user?.role || 'USER';

  const refreshUser = async () => {
    try {
      const response = await api.get('/Auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const handleGlobalLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('auth-logout', handleGlobalLogout);
    const checkAuth = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
    return () => window.removeEventListener('auth-logout', handleGlobalLogout);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const encryptedPassword = encryptPassword(password);
      await api.post('/Auth/login', { email, password: encryptedPassword });
      await refreshUser();

    } catch (error) {
      alert("invalid parameter");
      console.error(error);
    }
  };

  const signup = async (formData: any) => {
    try {
      const secureData = { 
        ...formData, 
        password: encryptPassword(formData.password) 
      };
      await api.post('/Auth/register', secureData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/Auth/logout');
    } catch (error) {
      console.error('Logout API failed', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        setUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};