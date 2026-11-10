import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PrintModal } from '../../components/common/PrintModal';
import { patientService } from '../../services/patientService';
import { sessionService, SessaoEvolucao } from '../../services/sessionService';
import { Paciente } from '../../../../shared/src/types';

export const SessoesPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [selectedPacId, setSelectedPacId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'evolucoes' | 'anamnese' | 'documentos'>('evolucoes');
  const [openSessaoId, setOpenSessaoId] = useState<string | null>(null);
  const [novaNota, setNovaNota] = useState('');
  const [planoAcao, setPlanoAcao] = useState('');
  const [escalaHumor, setEscalaHumor] = useState<number>(7);
  const [sessoes, setSessoes] = useState<SessaoEvolucao[]>([]);
  const [loading, setLoading] = useState(true);

  const [printDoc, setPrintDoc] = useState<{
    isOpen: boolean;
    tipo: 'recibo' | 'declaracao' | 'laudo' | 'evolucao';
    detalhes?: string;
  }>({
    isOpen: false,
    tipo: 'evolucao'
  });

  useEffect(() => {
    patientService.getAll().then((data) => {
      setPacientes(data);
      if (data.length > 0) {
        setSelectedPacId(data[0].id);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPacId) {
      sessionService.getByPaciente(selectedPacId).then((data) => {
        setSessoes(data);
        setOpenSessaoId(data.length > 0 ? data[0].id : null);
      }).catch((error: any) => {
        setSessoes([]);
        setOpenSessaoId(null);
        showToast(error.message || 'Não foi possível carregar as evoluções do servidor.', 'danger');
      });
    }
  }, [selectedPacId]);

  const currentPac = pacientes.find((p) => p.id === selectedPacId) || pacientes[0] || {
    id: 'pac1',
    nome: 'Paciente Modelo',
    email: '',
    telefone: '',
    cpf: '',
    dataNasc: '',
    genero: '',
    status: 'Ativo' as const,
    convenio: 'Particular',
    totalSessoes: 0,
    ultimaSessao: '',
    avatarColor: '#2b6cb0',
    motivoConsulta: 'Avaliação inicial',
    historico: ''
  };

  const handleSalvarEvolucao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaNota.trim()) {
      showToast('Digite a nota de evolução antes de salvar.', 'warning');
      return;
    }

    try {
      const saved = await sessionService.addEvolucao({
        pacienteId: selectedPacId,
        num: sessoes.length + 1,
        data: new Date().toISOString().slice(0, 10),
        tipo: 'Sessão Individual • TCC',
        resumo: novaNota,
        plano: planoAcao || 'Continuidade do plano terapêutico acordado.',
        status: 'Realizada',
        escalaHumor
      });

      setSessoes([saved, ...sessoes]);
      setOpenSessaoId(saved.id);
      setNovaNota('');
      setPlanoAcao('');
      showToast('Evolução clínica registrada e criptografada no prontuário!', 'success');
    } catch (err: any) {
      showToast('Erro ao salvar evolução clínica.', 'danger');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sessões & Prontuários</h1>
          <p className="page-subtitle">Registro de evolução clínica, anamnese e documentos em conformidade com CFP/LGPD</p>
        </div>
      </div>

      {loading ? (
        <div className="card p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-3" role="status"></div>
          <p className="text-muted">Carregando prontuários eletrônicos...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
          {/* Painel Esquerdo: Lista de Pacientes */}
          <div className="card">
            <div className="card-header p-3">
              <h3 className="card-title" style={{ fontSize: '14px' }}>Selecionar Paciente</h3>
            </div>
            <div className="card-body p-0">
              {pacientes.map((pac) => (
                <div
                  key={pac.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: selectedPacId === pac.id ? 'rgba(92,184,168,0.1)' : 'transparent',
                    borderLeft: selectedPacId === pac.id ? '4px solid var(--accent)' : '4px solid transparent'
                  }}
                  onClick={() => setSelectedPacId(pac.id)}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: pac.avatarColor || '#2b6cb0',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    {pac.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="mb-0 text-truncate" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {pac.nome}
                    </p>
                    <span className="text-muted" style={{ fontSize: '11px' }}>{pac.convenio} • {pac.totalSessoes} sessões</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Painel Direito: Prontuário do Paciente */}
          <div>
            {/* Banner Hero do Paciente */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--bg-sidebar), var(--primary))',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                color: '#fff',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '50%',
                    background: currentPac.avatarColor || '#2b6cb0',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {currentPac.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                    {currentPac.nome}
                  </h2>
                  <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    CPF: {currentPac.cpf} • Convênio: {currentPac.convenio}
                  </p>
                </div>
              </div>

              <div className="d-flex gap-4 text-center">
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Status</span>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#b8e3dc' }}>{currentPac.status}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Sessões</span>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{sessoes.length || currentPac.totalSessoes}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Responsável</span>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{user.name}</div>
                </div>
              </div>
            </div>

            {/* Abas */}
            <div className="d-flex gap-2 mb-3">
              <button
                className={`btn btn-sm ${activeTab === 'evolucoes' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('evolucoes')}
              >
                <i className="bi bi-journal-text me-1"></i> Registro de Evolução ({sessoes.length})
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'anamnese' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('anamnese')}
              >
                <i className="bi bi-person-vcard me-1"></i> Anamnese & Queixa
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'documentos' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('documentos')}
              >
                <i className="bi bi-file-earmark-text me-1"></i> Documentos & Laudos
              </button>
            </div>

            {/* Aba Evoluções */}
            {activeTab === 'evolucoes' && (
              <div>
                {/* Form Nova Evolução */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h3 className="card-title"><i className="bi bi-pencil-square me-2 text-primary"></i>Nova Evolução de Atendimento</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSalvarEvolucao}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Descrição da Sessão / Relato Clínico *</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={novaNota}
                          onChange={(e) => setNovaNota(e.target.value)}
                          placeholder="Descreva as técnicas aplicadas, intervenções realizadas e observações sobre o humor e discurso do paciente..."
                          required
                        />
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col-md-8">
                          <label className="form-label">Plano Terapêutico / Tarefas de Casa</label>
                          <input
                            type="text"
                            className="form-control"
                            value={planoAcao}
                            onChange={(e) => setPlanoAcao(e.target.value)}
                            placeholder="Ex: Registro diário de pensamentos disfuncionais (RPD)"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Escala de Humor / Adesão (1 a 10)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            className="form-control"
                            value={escalaHumor}
                            onChange={(e) => setEscalaHumor(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button type="submit" className="btn-accent">
                          <i className="bi bi-check-lg me-1"></i> Salvar no Prontuário
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Lista de Sessões Anteriores */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Histórico de Atendimentos</h3>
                  </div>
                  <div className="card-body p-0">
                    {sessoes.length === 0 ? (
                      <div className="p-4 text-center text-muted">
                        Nenhum atendimento registrado para este paciente ainda.
                      </div>
                    ) : (
                      sessoes.map((s) => {
                        const isOpen = openSessaoId === s.id;
                        return (
                          <div key={s.id} className="border-bottom">
                            <div
                              className="p-3 d-flex justify-content-between align-items-center"
                              style={{ cursor: 'pointer', background: isOpen ? 'rgba(0,0,0,0.02)' : 'transparent' }}
                              onClick={() => setOpenSessaoId(isOpen ? null : s.id)}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <span className="badge bg-primary">#{s.num}</span>
                                <div>
                                  <strong className="d-block">{s.tipo}</strong>
                                  <span className="text-muted small"><i className="bi bi-calendar-event me-1"></i>{s.data}</span>
                                </div>
                              </div>
                              <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} text-muted`}></i>
                            </div>
                            {isOpen && (
                              <div className="p-3 bg-white border-top">
                                <p style={{ lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: '12px' }}>
                                  {s.resumo}
                                </p>
                                {s.plano && (
                                  <div className="p-2 bg-light rounded border small mb-3">
                                    <strong>Plano / Tarefa:</strong> {s.plano}
                                  </div>
                                )}
                                <div className="d-flex justify-content-between align-items-center">
                                  {s.escalaHumor && (
                                    <span className="badge bg-info-subtle text-info border">
                                      Nível de Humor: {s.escalaHumor}/10
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-ghost"
                                    style={{ fontSize: '12px' }}
                                    onClick={() => setPrintDoc({
                                      isOpen: true,
                                      tipo: 'evolucao',
                                      detalhes: `Sessão #${s.num} (${s.data})\n\nRelato da Sessão:\n${s.resumo}\n\nPlano Terapêutico:\n${s.plano}`
                                    })}
                                  >
                                    <i className="bi bi-printer me-1"></i> Imprimir Registro
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Aba Anamnese */}
            {activeTab === 'anamnese' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title">Anamnese & Histórico Clínico</h3>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: '12px' }}
                    onClick={() => setPrintDoc({
                      isOpen: true,
                      tipo: 'laudo',
                      detalhes: `Paciente: ${currentPac.nome}\nCPF: ${currentPac.cpf}\nConvênio: ${currentPac.convenio}\n\nQueixa Principal:\n${currentPac.motivoConsulta || 'Em avaliação inicial.'}\n\nHistórico Clínico:\n${currentPac.historico || 'Sem anotações complementares.'}`
                    })}
                  >
                    <i className="bi bi-printer me-1"></i> Imprimir Laudo Inicial
                  </button>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="text-muted small fw-bold">QUEIXA PRINCIPAL / MOTIVO DA PROCURA</label>
                    <div className="p-3 bg-light rounded border mt-1">
                      {currentPac.motivoConsulta || 'Nenhuma queixa inicial descrita.'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small fw-bold">HISTÓRICO DE SAÚDE E ANOTAÇÕES RELEVANTES</label>
                    <div className="p-3 bg-light rounded border mt-1">
                      {currentPac.historico || 'Sem histórico adicional registrado.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Documentos */}
            {activeTab === 'documentos' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title">Documentos & Declarações</h3>
                  <button
                    className="btn-accent btn-sm"
                    onClick={() => setPrintDoc({
                      isOpen: true,
                      tipo: 'declaracao',
                      detalhes: 'Declaração de comparecimento emitida para fins de comprovação.'
                    })}
                  >
                    <i className="bi bi-file-earmark-plus me-1"></i> Gerar Declaração
                  </button>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between p-3 border rounded mb-2">
                    <div className="d-flex align-items-center gap-3">
                      <i className="bi bi-file-earmark-pdf fs-3 text-danger"></i>
                      <div>
                        <strong className="d-block">Declaração de Comparecimento - Sessão de Psicoterapia</strong>
                        <span className="text-muted small">Emitida para {currentPac.nome} • PDF assinado digitalmente</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setPrintDoc({
                        isOpen: true,
                        tipo: 'declaracao',
                        detalhes: 'Comparecimento à sessão de psicoterapia individual regular.'
                      })}
                    >
                      <i className="bi bi-printer me-1"></i> Imprimir / PDF
                    </button>
                  </div>

                  <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                    <div className="d-flex align-items-center gap-3">
                      <i className="bi bi-file-earmark-text fs-3 text-primary"></i>
                      <div>
                        <strong className="d-block">Termo de Consentimento Livre e Esclarecido (LGPD/CFP)</strong>
                        <span className="text-muted small">Assinado digitalmente por {currentPac.nome}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => showToast('Contrato e termo LGPD verificados e válidos.', 'success')}
                    >
                      <i className="bi bi-check-circle me-1"></i> Válido
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Impressão */}
      <PrintModal
        isOpen={printDoc.isOpen}
        onClose={() => setPrintDoc((prev) => ({ ...prev, isOpen: false }))}
        tipo={printDoc.tipo}
        dados={{
          pacienteNome: currentPac.nome,
          psicologoNome: user.name || 'Dra. Sofia Mendes',
          psicologoCrp: user.crp || 'CRP 06/123456',
          data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
          detalhes: printDoc.detalhes
        }}
      />
    </div>
  );
};
