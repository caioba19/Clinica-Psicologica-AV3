import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const PerfilPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dados' | 'seguranca' | 'notificacoes'>('dados');

  const [nome, setNome] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [crp, setCrp] = useState(user.crp);
  
  const [telefone, setTelefone] = useState(user.telefone || '');
  const [especialidade, setEspecialidade] = useState(user.areaAtuacao || '');
  const [bio, setBio] = useState(user.bio || '');

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifLembrete, setNotifLembrete] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await api.patch<any>('/auth/profile', {
        nome, email, telefone, crp: crp ? `CRP ${crp.replace(/^CRP\s*/i, '')}` : '', areaAtuacao: especialidade, bio
      });
      updateProfile({ name: updated.nome, email: updated.email, telefone: updated.telefone || '',
        crp: updated.crp?.replace(/^CRP\s*/i, '') || '', areaAtuacao: updated.areaAtuacao || '', bio: updated.bio || '',
        avatarText: updated.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() });
      showToast('Dados do perfil salvos no servidor.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Não foi possível salvar o perfil.', 'danger');
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) return showToast('Preencha os três campos de senha.', 'warning');
    if (novaSenha.length < 8) return showToast('A nova senha deve ter pelo menos 8 caracteres.', 'warning');
    if (novaSenha !== confirmarSenha) return showToast('A confirmação da senha não confere.', 'warning');
    try {
      setSavingPassword(true);
      await api.patch('/auth/password', { senhaAtual, novaSenha });
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      showToast('Senha alterada no servidor.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Não foi possível alterar a senha.', 'danger');
    } finally { setSavingPassword(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meu Perfil Profissional</h1>
          <p className="page-subtitle">Gerencie suas credenciais profissionais, dados de acesso e segurança</p>
        </div>
      </div>

      {/* Hero do Perfil */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--bg-sidebar) 0%, var(--primary) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          marginBottom: '28px',
          color: '#fff',
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--primary-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 700,
            color: '#fff',
            border: '3px solid rgba(255,255,255,0.3)',
            flexShrink: 0
          }}
        >
          {user.avatarText || 'DS'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {user.name}
          </h2>
          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 12px' }}>
            {user.role} • CRP {user.crp}
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <span className="badge badge-success">
              <i className="bi bi-shield-check me-1"></i> Cadastro CFP Ativo
            </span>
            <span className="badge badge-info">
              <i className="bi bi-geo-alt me-1"></i> São Paulo / SP
            </span>
          </div>
        </div>

        <div className="d-flex gap-4 text-center">
          <div>
            <strong style={{ fontSize: '22px', display: 'block' }}>28</strong>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Pacientes</span>
          </div>
          <div>
            <strong style={{ fontSize: '22px', display: 'block' }}>8+</strong>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Anos de Exp.</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="d-flex gap-2 border-bottom mb-4">
        <button
          type="button"
          className={`btn ${activeTab === 'dados' ? 'btn-primary' : 'btn-ghost'} border-bottom-0 rounded-bottom-0`}
          onClick={() => setActiveTab('dados')}
        >
          <i className="bi bi-person me-1"></i> Dados Cadastrais
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'seguranca' ? 'btn-primary' : 'btn-ghost'} border-bottom-0 rounded-bottom-0`}
          onClick={() => setActiveTab('seguranca')}
        >
          <i className="bi bi-lock me-1"></i> Segurança & Senha
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'notificacoes' ? 'btn-primary' : 'btn-ghost'} border-bottom-0 rounded-bottom-0`}
          onClick={() => setActiveTab('notificacoes')}
        >
          <i className="bi bi-bell me-1"></i> Notificações
        </button>
      </div>

      {/* Aba Dados Cadastrais */}
      {activeTab === 'dados' && (
        <form onSubmit={handleSaveProfile}>
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Informações Pessoais & Registro</h3>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">CRP (Registro Profissional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={crp}
                    onChange={(e) => setCrp(e.target.value)}
                    required={user.perfil === 'psicologo'}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Cargo / Título</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.role}
                    disabled
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">E-mail de Contato</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telefone / WhatsApp Profissional</label>
                  <input
                    type="text"
                    className="form-control"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Abordagem Principal & Especialidades</label>
                <input
                  type="text"
                  className="form-control"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Biografia / Resumo Profissional</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
            <div className="card-footer bg-white text-end">
              <button type="submit" className="btn-accent" disabled={savingProfile}>
                <i className="bi bi-check-lg me-1"></i> Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Aba Segurança */}
      {activeTab === 'seguranca' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Alteração de Senha & Segurança</h3>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Senha Atual</label>
                <input type="password" autoComplete="current-password" className="form-control" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Nova Senha</label>
                <input type="password" autoComplete="new-password" className="form-control" minLength={8} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Confirmar Nova Senha</label>
                <input type="password" autoComplete="new-password" className="form-control" minLength={8} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
              </div>
            </div>

            <button
              type="button"
              className="btn-accent mb-4"
              onClick={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? 'Atualizando...' : 'Atualizar Senha'}
            </button>

            <hr />

            <div className="d-flex align-items-center justify-content-between py-2">
              <div>
                <strong className="d-block">Autenticação em Dois Fatores (2FA)</strong>
                <span className="text-muted small">Proteja sua conta com código via aplicativo autenticador</span>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => showToast('A autenticação em dois fatores ainda não está configurada.', 'warning')}
              >
                Configurar 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aba Notificações */}
      {activeTab === 'notificacoes' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Preferências de Notificação</h3>
          </div>
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
              <div>
                <strong className="d-block">Notificações por E-mail</strong>
                <span className="text-muted small">Receba avisos de novos agendamentos e cancelamentos</span>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.checked)}
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
              <div>
                <strong className="d-block">Lembretes Automáticos aos Pacientes</strong>
                <span className="text-muted small">Enviar mensagem WhatsApp/SMS 24h antes da consulta</span>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={notifLembrete}
                  onChange={(e) => setNotifLembrete(e.target.checked)}
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between py-3">
              <div>
                <strong className="d-block">Resumo Financeiro Semanal</strong>
                <span className="text-muted small">Receba um relatório com o saldo e faturamento da semana</span>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={notifSms}
                  onChange={(e) => setNotifSms(e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
