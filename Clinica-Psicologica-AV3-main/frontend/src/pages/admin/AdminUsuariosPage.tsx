import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { UsuarioSistema, PsicologoProfissional, LogAuditoria, PerfilUsuario } from '../../../../shared/src/types';
import { useToast } from '../../context/ToastContext';
import { maskCRP } from '../../utils/masks';
import { adminUserService as userService } from '../../services/userService';
import { patientService } from '../../services/patientService';
import { psychologistService } from '../../services/psychologistService';
import { auditLogService } from '../../services/auditLogService';
import { useAuth } from '../../context/AuthContext';

export const AdminUsuariosPage: React.FC = () => {
  const { showToast, confirmAction } = useToast();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'usuarios' | 'psicologos' | 'logs'>('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoLogFilter, setTipoLogFilter] = useState<'todos' | 'acesso' | 'cadastro' | 'prontuario'>('todos');

  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPacientesCount, setTotalPacientesCount] = useState(0);

  const [psicologos, setPsicologos] = useState<PsicologoProfissional[]>([]);

  const [logs, setLogs] = useState<LogAuditoria[]>([]);

  // Modal Novo Usuário
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoPerfil, setNovoPerfil] = useState<'administrador' | 'psicologo'>('psicologo');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoCrp, setNovoCrp] = useState('');
  const [novaArea, setNovaArea] = useState('Psicologia Clínica (TCC)');

  // Modal Edição de Usuário
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioSistema | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPerfil, setEditPerfil] = useState<PerfilUsuario>('psicologo');
  const [editCrp, setEditCrp] = useState('');
  const [editArea, setEditArea] = useState('Psicologia Clínica (TCC)');

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, patientsData] = await Promise.all([
        userService.getAll().catch(() => []),
        patientService.getAll().catch(() => [])
      ]);
      setUsuarios(usersData);
      setTotalPacientesCount(patientsData.length);

      const psiData = await psychologistService.getAll().catch(() => []);
      setPsicologos(psiData);

      const logsData = await auditLogService.getAll().catch(() => []);
      setLogs(logsData);
    } catch (err: any) {
      showToast('Erro ao carregar dados do painel.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAtivos = usuarios.filter((u) => u.situacao?.toLowerCase() === 'ativo').length;
  const totalBloqueados = usuarios.filter((u) => u.situacao?.toLowerCase() === 'bloqueado').length;

  const alternarSituacao = (id: string, nome: string, situacaoAtual: string) => {
    const isAtivo = situacaoAtual?.toLowerCase() === 'ativo';
    const novaSituacao = isAtivo ? 'Bloqueado' : 'Ativo';
    const acaoTexto = isAtivo ? 'bloquear' : 'desbloquear/ativar';

    confirmAction(`Deseja realmente ${acaoTexto} o acesso de ${nome}?`, async () => {
      try {
        await userService.updateSituacao(id, novaSituacao);
        await loadData();

        showToast(`Situação de ${nome} alterada com sucesso.`, 'success');
      } catch (err: any) {
        showToast('Erro ao alterar situação.', 'danger');
      }
    });
  };

  const handleAbrirEdicao = (u: UsuarioSistema) => {
    setUsuarioEditando(u);
    setEditNome(u.nome);
    setEditEmail(u.email);
    setEditPerfil(u.perfil);
    const psi = psicologos.find((p) => p.usuarioId === u.id);
    setEditCrp(psi ? psi.registroCrp : '');
    setEditArea(psi ? psi.areaAtuacao : 'Psicologia Clínica (TCC)');
    setModalEditOpen(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;
    if (!editNome.trim() || !editEmail.trim()) {
      showToast('Nome e e-mail são obrigatórios.', 'warning');
      return;
    }
    try {
      await userService.update(usuarioEditando.id, {
        nome: editNome.trim(),
        email: editEmail.trim(),
        perfil: editPerfil,
        registroCrp: editPerfil === 'psicologo' ? editCrp.trim() : undefined,
        areaAtuacao: editPerfil === 'psicologo' ? editArea : undefined
      });
      showToast(`Usuário ${editNome} atualizado com sucesso!`, 'success');
      setModalEditOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar dados do usuário.', 'danger');
    }
  };

  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoEmail) {
      showToast('Preencha os campos obrigatórios (*)', 'warning');
      return;
    }

    try {
      await userService.create({
        nome: novoNome,
        email: novoEmail,
        perfil: novoPerfil,
        senha: novaSenha,
        registroCrp: novoPerfil === 'psicologo' ? novoCrp.trim() : undefined,
        areaAtuacao: novoPerfil === 'psicologo' ? novaArea : undefined
      });

      await loadData();
      showToast(`Usuário ${novoNome} criado com sucesso!`, 'success');
      setModalNovoOpen(false);
      setNovoNome('');
      setNovoEmail('');
      setNovoCrp('');
      setNovaSenha('');
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar usuário.', 'danger');
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.perfil.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const psicologosFiltrados = psicologos.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.areaAtuacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.registroCrp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const logsFiltrados = logs.filter((l) => {
    const matchTerm =
      l.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.acao.toLowerCase().includes(searchTerm.toLowerCase());

    if (tipoLogFilter === 'todos') return matchTerm;
    if (tipoLogFilter === 'acesso') return matchTerm && (l.acao.includes('login') || l.acao.includes('acesso'));
    if (tipoLogFilter === 'cadastro') return matchTerm && (l.acao.includes('Cadastrou') || l.acao.includes('cadastro'));
    if (tipoLogFilter === 'prontuario') return matchTerm && (l.acao.includes('prontuário') || l.acao.includes('evolução'));
    return matchTerm;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Administração Geral</h1>
          <p className="page-subtitle">Gestão de acessos, profissionais cadastrados e auditoria de ações</p>
        </div>
        <button className="btn-accent" onClick={() => setModalNovoOpen(true)}>
          <i className="bi bi-person-plus-fill me-1"></i> Novo Usuário
        </button>
      </div>

      <div className="grid-4 mb-24">
        <StatCard
          title="Total de Usuários"
          value={usuarios.length.toString()}
          change={`${totalAtivos} ativos`}
          changeType="up"
          icon="people-fill"
          color="blue"
        />
        <StatCard
          title="Psicólogos Habilitados"
          value={psicologos.filter((p) => p.situacao === 'Ativo').length.toString()}
          change="Corpo clínico"
          changeType="neutral"
          icon="award-fill"
          color="teal"
        />
        <StatCard
          title="Pacientes Cadastrados"
          value={totalPacientesCount.toString()}
          change="Registros no sistema"
          changeType="neutral"
          icon="person-lines-fill"
          color="green"
        />
        <StatCard
          title="Acessos Bloqueados"
          value={totalBloqueados.toString()}
          change={totalBloqueados > 0 ? 'Ação requerida' : 'Nenhum bloqueio'}
          changeType={totalBloqueados > 0 ? 'down' : 'up'}
          icon="shield-lock-fill"
          color="red"
        />
      </div>

      <div className="card mb-4">
        <div className="card-body p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${activeTab === 'usuarios' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('usuarios')}
            >
              <i className="bi bi-people me-1"></i> Usuários do Sistema ({usuarios.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'psicologos' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('psicologos')}
            >
              <i className="bi bi-person-badge me-1"></i> Psicólogos & CRP ({psicologos.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('logs')}
            >
              <i className="bi bi-clock-history me-1"></i> Logs de Auditoria ({logs.length})
            </button>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: '280px' }}>
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Filtrar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === 'logs' && (
              <select
                className="form-select form-select-sm"
                value={tipoLogFilter}
                onChange={(e: any) => setTipoLogFilter(e.target.value)}
                style={{ width: '140px' }}
              >
                <option value="todos">Todos Logs</option>
                <option value="acesso">Acessos/Login</option>
                <option value="cadastro">Cadastros</option>
                <option value="prontuario">Prontuário</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-3" role="status"></div>
          <p className="text-muted">Carregando painel administrativo...</p>
        </div>
      ) : activeTab === 'usuarios' && (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Perfil de Acesso</th>
                  <th>Situação</th>
                  <th>Data Cadastro</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: u.perfil === 'administrador' ? '#2b6cb0' : '#2c5f6e',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700
                          }}
                        >
                          {u.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="fw-semibold">{u.nome}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.perfil === 'administrador' ? 'bg-primary-subtle text-primary border border-primary' : 'bg-info-subtle text-info border border-info'}`}>
                        {u.perfil === 'administrador' ? 'Administrador Geral' : u.perfil === 'psicologo' ? 'Psicólogo Clínico' : 'Paciente'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.situacao?.toLowerCase() === 'ativo' ? 'bg-success-subtle text-success border border-success' : u.situacao?.toLowerCase() === 'bloqueado' ? 'bg-danger-subtle text-danger border border-danger' : 'bg-secondary-subtle text-secondary border border-secondary'}`}>
                        {u.situacao ? u.situacao.toUpperCase() : 'INATIVO'}
                      </span>
                    </td>
                    <td className="text-muted small">{u.criadoEm}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleAbrirEdicao(u)}
                        title="Editar Dados do Usuário"
                      >
                        <i className="bi bi-pencil-fill me-1"></i> Editar
                      </button>
                      <button
                        className={`btn btn-sm ${u.situacao?.toLowerCase() === 'ativo' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => alternarSituacao(u.id, u.nome, u.situacao)}
                        title={u.situacao?.toLowerCase() === 'ativo' ? 'Bloquear Acesso' : 'Desbloquear / Ativar'}
                      >
                        <i className={`bi ${u.situacao?.toLowerCase() === 'ativo' ? 'bi-lock-fill' : 'bi-unlock-fill'} me-1`}></i>
                        {u.situacao?.toLowerCase() === 'ativo' ? 'Bloquear' : 'Liberar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && activeTab === 'psicologos' && (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Profissional</th>
                  <th>Registro CRP</th>
                  <th>Área de Atuação</th>
                  <th>E-mail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {psicologosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong className="d-block">{p.nome}</strong>
                    </td>
                    <td><span className="badge bg-light text-dark border">{p.registroCrp}</span></td>
                    <td>{p.areaAtuacao}</td>
                    <td className="text-muted">{p.email}</td>
                    <td>
                      <span className={`badge ${p.situacao === 'Ativo' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                        {p.situacao ? p.situacao.toUpperCase() : 'INATIVO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && activeTab === 'logs' && (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Data / Hora</th>
                  <th>Autor da Ação</th>
                  <th>Operação / Evento Registrado</th>
                  <th className="text-end">Rastreabilidade</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.map((l) => (
                  <tr key={l.id}>
                    <td className="text-muted small" style={{ width: '180px' }}>
                      <i className="bi bi-clock me-1"></i> {l.dataHora}
                    </td>
                    <td>
                      <span className="fw-semibold">{l.autor}</span>
                    </td>
                    <td>
                      <span>{l.acao}</span>
                    </td>
                    <td className="text-end">
                      <span className="badge bg-light text-muted border">
                        <i className="bi bi-shield-check me-1 text-success"></i> Auditado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {modalEditOpen && usuarioEditando && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Usuário do Sistema</h5>
                <button type="button" className="btn-close" onClick={() => setModalEditOpen(false)}></button>
              </div>
              <form onSubmit={handleSalvarEdicao}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">E-mail de Acesso *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Perfil de Acesso *</label>
                    <select
                      className="form-select"
                      value={editPerfil}
                      disabled={usuarioEditando.perfil === 'paciente' || usuarioEditando.id === currentUser.id}
                      onChange={(e: any) => setEditPerfil(e.target.value)}
                    >
                      {usuarioEditando.perfil === 'paciente' && <option value="paciente">Paciente</option>}
                      <option value="psicologo">Psicólogo</option>
                      <option value="administrador">Administrador Geral</option>
                    </select>
                  </div>

                  {editPerfil === 'psicologo' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Registro Profissional (CRP)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editCrp}
                          onChange={(e) => setEditCrp(maskCRP(e.target.value))}
                          placeholder="CRP 06/123456"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Área de Atuação</label>
                        <select
                          className="form-select"
                          value={editArea}
                          onChange={(e) => setEditArea(e.target.value)}
                        >
                          <option value="Psicologia Clínica (TCC)">Psicologia Clínica (TCC)</option>
                          <option value="Psicanálise">Psicanálise</option>
                          <option value="Organizacional e do Trabalho">Organizacional e do Trabalho</option>
                          <option value="Escolar e Educacional">Escolar e Educacional</option>
                          <option value="Hospitalar">Hospitalar</option>
                          <option value="Neuropsicologia">Neuropsicologia</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalEditOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-accent">
                    <i className="bi bi-check-lg me-1"></i> Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Usuário */}
      {modalNovoOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Novo Usuário do Sistema</h5>
                <button type="button" className="btn-close" onClick={() => setModalNovoOpen(false)}></button>
              </div>
              <form onSubmit={handleCriarUsuario}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Ex: Carlos Eduardo Ramos"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">E-mail de Acesso *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={novoEmail}
                      onChange={(e) => setNovoEmail(e.target.value)}
                      placeholder="carlos@clinica.com"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Perfil de Acesso *</label>
                    <select
                      className="form-select"
                      value={novoPerfil}
                      onChange={(e: any) => setNovoPerfil(e.target.value)}
                    >
                      <option value="psicologo">Psicólogo</option>
                      <option value="administrador">Administrador Geral</option>
                    </select>
                  </div>

                  {novoPerfil === 'psicologo' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Registro Profissional (CRP)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={novoCrp}
                          onChange={(e) => setNovoCrp(maskCRP(e.target.value))}
                          placeholder="CRP 06/123456"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Área de Atuação</label>
                        <select
                          className="form-select"
                          value={novaArea}
                          onChange={(e) => setNovaArea(e.target.value)}
                        >
                          <option value="Psicologia Clínica (TCC)">Psicologia Clínica (TCC)</option>
                          <option value="Psicanálise">Psicanálise</option>
                          <option value="Organizacional e do Trabalho">Organizacional e do Trabalho</option>
                          <option value="Escolar e Educacional">Escolar e Educacional</option>
                          <option value="Hospitalar">Hospitalar</option>
                          <option value="Neuropsicologia">Neuropsicologia</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Senha inicial (mínimo 8 caracteres) *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalNovoOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-accent">
                    <i className="bi bi-check-lg me-1"></i> Criar Usuário
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
