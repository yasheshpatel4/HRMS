import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../Api';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
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

export const AuthProvider = ({ children } : AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const role = user?.role || 'USER';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/Auth/me');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/Auth/login', { email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
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
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
