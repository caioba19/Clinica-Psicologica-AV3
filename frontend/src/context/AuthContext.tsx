import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PerfilUsuario } from '../../../shared/src/types';
import { api } from '../services/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  perfil: PerfilUsuario;
  crp?: string;
  role: string;
  avatarText: string;
  areaAtuacao?: string;
  telefone?: string;
  bio?: string;
}

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

export const mockUsers: Record<PerfilUsuario, UserProfile> = {
  administrador: {
    id: 'u1', name: 'Renata Farias', email: 'admin@clinica.com', perfil: 'administrador',
    role: 'Administradora Geral', avatarText: 'RF'
  },
  psicologo: {
    id: 'u2', name: 'Dra. Sofia Mendes', email: 'dra.sofia@psicomanager.com.br', perfil: 'psicologo',
    crp: '06/123456', role: 'Psicóloga Clínica (TCC)', avatarText: 'DS', areaAtuacao: 'Psicologia Clínica'
  },
  paciente: {
    id: 'pac1', name: 'Lucas Ferreira Mendes', email: 'lucas.mendes@email.com', perfil: 'paciente',
    role: 'Paciente / Cliente', avatarText: 'LF'
  }
};

function mapAccount(account: any): UserProfile {
  const name = account.nome || account.nome_completo || '';
  const perfil = account.perfil as PerfilUsuario;
  return {
    id: String(account.id),
    name,
    email: account.email,
    perfil,
    crp: account.crp?.replace(/^CRP\s*/i, ''),
    telefone: account.telefone || '',
    bio: account.bio || '',
    role: perfil === 'administrador' ? 'Administrador' : perfil === 'paciente' ? 'Paciente' : account.areaAtuacao || 'Psicólogo',
    avatarText: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase() || 'PS',
    areaAtuacao: account.areaAtuacao || ''
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(mockUsers.psicologo);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Remove legacy JavaScript-readable JWTs; sessions now use an HttpOnly cookie.
    localStorage.removeItem('psico_token');
    localStorage.removeItem('psico_user');
    localStorage.removeItem('psico_auth');
    api.get<any>('/auth/me')
      .then((account) => {
        setUser(mapAccount(account));
        setIsAuthenticated(true);
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    const result = await api.post<{ user: any }>('/auth/login', { email, senha: pass });
    if (!result.user) throw new Error('O servidor não retornou os dados da conta.');
    const mappedUser = mapAccount(result.user);
    setUser(mappedUser);
    setIsAuthenticated(true);
    return mappedUser;
  };

  const logout = () => {
    void api.post('/auth/logout', {}).catch(() => undefined);
    setIsAuthenticated(false);
    setUser(mockUsers.psicologo);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((previous) => ({ ...previous, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
