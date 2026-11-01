import { api } from './api';
import { UsuarioSistema, PerfilUsuario } from '../../../shared/src/types';

export const adminUserService = {
  async getAll(): Promise<UsuarioSistema[]> {
    return await api.get<UsuarioSistema[]>('/users');
  },

  async create(data: Partial<UsuarioSistema> & { senha?: string; registroCrp?: string; areaAtuacao?: string }): Promise<UsuarioSistema> {
    return await api.post<UsuarioSistema>('/users', data);
  },

  async update(id: string, data: { nome?: string; email?: string; perfil?: PerfilUsuario; registroCrp?: string; areaAtuacao?: string }): Promise<UsuarioSistema> {
    return await api.patch<UsuarioSistema>(`/users/${id}`, data);
  },

  async updateSituacao(id: string, situacao: 'Ativo' | 'Inativo' | 'Bloqueado'): Promise<UsuarioSistema> {
    return await api.patch<UsuarioSistema>(`/users/${id}/situacao`, { situacao });
  }
};
