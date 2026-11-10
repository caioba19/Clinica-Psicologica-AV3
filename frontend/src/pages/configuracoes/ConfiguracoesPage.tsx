import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { PreferenciasUsuario } from '../../../../shared/src/types';

export const ConfiguracoesPage: React.FC = () => {
  const { showToast, confirmAction } = useToast();
  const [activeMenu, setActiveMenu] = useState<'clinica' | 'agenda' | 'lgpd' | 'integracoes'>('clinica');

  const [duracaoSessao, setDuracaoSessao] = useState('50');
  const [intervaloSessao, setIntervaloSessao] = useState('10');
  const [lembreteHoras, setLembreteHoras] = useState('24');
  const [valorSessaoPadrao, setValorSessaoPadrao] = useState('220');
  const [preferences, setPreferences] = useState<PreferenciasUsuario>({ nomeClinica: '', documentoClinica: '', enderecoClinica: '', cidadeClinica: '', duracaoSessao: 50, intervaloSessao: 10, lembreteHoras: 24, valorSessaoPadrao: 220, notifEmail: false, notifSms: false, notifLembrete: true });

  useEffect(() => {
    api.get<PreferenciasUsuario>('/preferences').then((saved) => {
      setPreferences(saved);
      setDuracaoSessao(String(saved.duracaoSessao));
      setIntervaloSessao(String(saved.intervaloSessao));
      setLembreteHoras(String(saved.lembreteHoras));
      setValorSessaoPadrao(String(saved.valorSessaoPadrao));
    }).catch(() => showToast('Não foi possível carregar as preferências salvas.', 'error'));
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/preferences', { ...preferences, duracaoSessao: Number(duracaoSessao), intervaloSessao: Number(intervaloSessao), lembreteHoras: Number(lembreteHoras), valorSessaoPadrao: Number(valorSessaoPadrao) });
      showToast('Configurações salvas com sucesso!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Não foi possível salvar as configurações.', 'error');
    }
  };

  const handleLimparDados = () => {
    confirmAction('ATENÇÃO: Deseja apagar todos os dados de teste salvos localmente?', () => {
      localStorage.clear();
      showToast('Dados limpos. Recarregando...', 'warning');
      setTimeout(() => window.location.reload(), 800);
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Preferências gerais, regras de agendamento, LGPD e integrações</p>
        </div>
        <button className="btn-accent" onClick={handleSave}>
          <i className="bi bi-check2-circle me-1"></i> Salvar Preferências
        </button>
      </div>

      <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        {/* Menu Lateral de Configurações */}
        <div className="card p-0">
          <div className="p-3 bg-light border-bottom text-muted small fw-bold text-uppercase">
            Categorias
          </div>
          <div className="d-flex flex-column">
            <button
              type="button"
              className={`btn text-start rounded-0 border-0 p-3 ${activeMenu === 'clinica' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveMenu('clinica')}
            >
              <i className="bi bi-hospital me-2"></i> Dados da Clínica
            </button>
            <button
              type="button"
              className={`btn text-start rounded-0 border-0 p-3 ${activeMenu === 'agenda' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveMenu('agenda')}
            >
              <i className="bi bi-clock-history me-2"></i> Regras da Agenda
            </button>
            <button
              type="button"
              className={`btn text-start rounded-0 border-0 p-3 ${activeMenu === 'lgpd' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveMenu('lgpd')}
            >
              <i className="bi bi-shield-check me-2"></i> Privacidade & LGPD
            </button>
            <button
              type="button"
              className={`btn text-start rounded-0 border-0 p-3 ${activeMenu === 'integracoes' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveMenu('integracoes')}
            >
              <i className="bi bi-puzzle me-2"></i> Integrações
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div>
          {activeMenu === 'clinica' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Dados Gerais do Consultório / Clínica</h3>
              </div>
              <div className="card-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Nome do Consultório / Clínica</label>
                    <input type="text" className="form-control" value={preferences.nomeClinica} onChange={(e) => setPreferences({ ...preferences, nomeClinica: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">CNPJ ou CPF Responsável</label>
                    <input type="text" className="form-control" value={preferences.documentoClinica} onChange={(e) => setPreferences({ ...preferences, documentoClinica: e.target.value })} />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-8">
                    <label className="form-label">Endereço Comercial</label>
                    <input type="text" className="form-control" value={preferences.enderecoClinica} onChange={(e) => setPreferences({ ...preferences, enderecoClinica: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Cidade / Estado</label>
                    <input type="text" className="form-control" value={preferences.cidadeClinica} onChange={(e) => setPreferences({ ...preferences, cidadeClinica: e.target.value })} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Valor Padrão da Sessão (R$)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ maxWidth: '200px' }}
                    value={valorSessaoPadrao}
                    onChange={(e) => setValorSessaoPadrao(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'agenda' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Regras de Horários & Atendimento</h3>
              </div>
              <div className="card-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Duração Padrão da Sessão (minutos)</label>
                    <select
                      className="form-select"
                      value={duracaoSessao}
                      onChange={(e) => setDuracaoSessao(e.target.value)}
                    >
                      <option value="45">45 minutos</option>
                      <option value="50">50 minutos (Recomendado)</option>
                      <option value="60">60 minutos (1 hora)</option>
                      <option value="90">90 minutos (Casal / Família)</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Intervalo Entre Sessões (minutos)</label>
                    <select
                      className="form-select"
                      value={intervaloSessao}
                      onChange={(e) => setIntervaloSessao(e.target.value)}
                    >
                      <option value="5">5 minutos</option>
                      <option value="10">10 minutos</option>
                      <option value="15">15 minutos</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Antecedência para Lembrete Automático (WhatsApp/E-mail)</label>
                  <select
                    className="form-select"
                    value={lembreteHoras}
                    onChange={(e) => setLembreteHoras(e.target.value)}
                  >
                    <option value="12">12 horas antes</option>
                    <option value="24">24 horas antes (1 dia)</option>
                    <option value="48">48 horas antes (2 dias)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'lgpd' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Conformidade LGPD & Prontuário CFP</h3>
              </div>
              <div className="card-body">
                <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-shield-check fs-4"></i>
                  <div>
                    <strong>Criptografia de prontuários:</strong> O servidor exige uma chave AES-256-GCM para armazenar anotações e planos clínicos criptografados. Backups automáticos não estão configurados.
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                  <div>
                    <strong className="d-block">Guarda de Prontuários por 5 Anos</strong>
                    <span className="text-muted small">Atende a exigência da Resolução CFP nº 01/2009</span>
                  </div>
                  <span className="badge badge-success">Ativado</span>
                </div>

                <div className="d-flex align-items-center justify-content-between py-3">
                  <div>
                    <strong className="d-block">Termo de Consentimento LGPD Obrigatório</strong>
                    <span className="text-muted small">Exigir aceite de novos pacientes antes do início do tratamento</span>
                  </div>
                  <span className="badge badge-success">Ativado</span>
                </div>

                <div className="mt-4 p-3 bg-light rounded border">
                  <strong className="text-danger d-block mb-1">Zona de Manutenção Local</strong>
                  <p className="text-muted small mb-3">Limpa o armazenamento local do navegador e reinicia o estado dos dados.</p>
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleLimparDados}>
                    <i className="bi bi-trash me-1"></i> Resetar Dados de Demonstração
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'integracoes' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Serviços Conectados</h3>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between p-3 border rounded mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-google fs-3 text-primary"></i>
                    <div>
                      <strong className="d-block">Google Calendar & Meet</strong>
                      <span className="text-muted small">Sincronização de agenda e criação de salas virtuais</span>
                    </div>
                  </div>
                  <span className="badge badge-warning">Não configurado</span>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 border rounded mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-whatsapp fs-3 text-success"></i>
                    <div>
                      <strong className="d-block">WhatsApp Business API</strong>
                      <span className="text-muted small">Envio automático de lembretes e confirmações</span>
                    </div>
                  </div>
                  <span className="badge badge-warning">Não configurado</span>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-qr-code fs-3 text-dark"></i>
                    <div>
                      <strong className="d-block">Gateway PIX Automático</strong>
                      <span className="text-muted small">Geração de QR Code dinâmico para cobrança de sessões</span>
                    </div>
                  </div>
                  <span className="badge badge-warning">Não configurado</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
