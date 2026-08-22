import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { UsuarioSistema, PsicologoProfissional, LogAuditoria } from '../../types';
import { useToast } from '../../context/ToastContext';
import { maskCRP } from '../../utils/masks';
import { adminUserService as userService } from '../../services/userService';
import { patientService } from '../../services/patientService';

export const AdminUsuariosPage: React.FC = () => {
  const { showToast, confirmAction } = useToast();

  const [activeTab, setActiveTab] = useState<'usuarios' | 'psicologos' | 'logs'>('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoLogFilter, setTipoLogFilter] = useState<'todos' | 'acesso' | 'cadastro' | 'prontuario'>('todos');

  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPacientesCount, setTotalPacientesCount] = useState(0);

  const [psicologos, setPsicologos] = useState<PsicologoProfissional[]>([
    { id: 'p1', usuarioId: 'u2', nome: 'Dra. Sofia Mendes', email: 'dra.sofia@psicomanager.com.br', areaAtuacao: 'Psicologia Clínica (TCC)', registroCrp: 'CRP 06/123456', situacao: 'Ativo' },
    { id: 'p2', usuarioId: 'u3', nome: 'Dr. Roberto Alves', email: 'roberto.alves@clinica.com', areaAtuacao: 'Organizacional e do Trabalho', registroCrp: 'CRP 06/543210', situacao: 'Ativo' },
    { id: 'p3', usuarioId: 'u5', nome: 'Dr. Marcos Vinicius', email: 'marcos.v@clinica.com', areaAtuacao: 'Escolar e Educacional', registroCrp: 'CRP 06/987654', situacao: 'Bloqueado' }
  ]);

  const [logs, setLogs] = useState<LogAuditoria[]>([
    { id: 'l1', autor: 'Renata Farias (Admin)', acao: 'Bloqueou o acesso de Marcos Vinicius por pendência cadastral', dataHora: '17/08/2026 às 10:22' },
    { id: 'l2', autor: 'Renata Farias (Admin)', acao: 'Cadastrou o psicólogo Roberto Alves no sistema', dataHora: '10/08/2026 às 16:05' },
    { id: 'l3', autor: 'Dra. Sofia Mendes (Psi)', acao: 'Atualizou prontuário de Lucas Ferreira Mendes', dataHora: '09/08/2026 às 08:41' },
    { id: 'l4', autor: 'Sistema (Autenticação)', acao: 'Tentativa de login com senha incorreta: dra.sofia@psicomanager.com.br', dataHora: '08/08/2026 às 14:12' }
  ]);

  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoPerfil, setNovoPerfil] = useState<'administrador' | 'psicologo' | 'paciente'>('psicologo');
  const [novoCrp, setNovoCrp] = useState('');
  const [novaArea, setNovaArea] = useState('Psicologia Clínica (TCC)');

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, patientsData] = await Promise.all([
        userService.getAll(),
        patientService.getAll()
      ]);
      setUsuarios(usersData);
      setTotalPacientesCount(patientsData.length);
    } catch (err: any) {
      showToast('Erro ao carregar usuários.', 'danger');
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
    const isAtivo = situacaoAtual?.toLowerCase() === 'Ativo';
    const novaSituacao = isAtivo ? 'Bloqueado' : 'Ativo';
    const acaoTexto = isAtivo ? 'bloquear' : 'desbloquear/ativar';

    confirmAction(`Deseja realmente ${acaoTexto} o acesso de ${nome}?`, async () => {
      try {
        await userService.updateSituacao(id, novaSituacao);
        await loadData();

        const novoLog: LogAuditoria = {
          id: Math.random().toString(),
          autor: 'Renata Farias (Admin)',
          acao: `${novaSituacao === 'Bloqueado' ? 'Bloqueou' : 'Liberou'} o acesso de ${nome}`,
          dataHora: 'Agora mesmo'
        };
        setLogs([novoLog, ...logs]);
        showToast(`Situação de ${nome} alterada com sucesso.`, 'success');
      } catch (err: any) {
        showToast('Erro ao alterar situação.', 'danger');
      }
    });
  };

  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoEmail) {
      showToast('Preencha os campos obrigatórios (*)', 'warning');
      return;
    }

    try {
      const newUser = await userService.create({
        nome: novoNome,
        email: novoEmail,
        perfil: novoPerfil
      });

      if (novoPerfil === 'psicologo') {
        const novoPsi: PsicologoProfissional = {
          id: 'p' + (psicologos.length + 1),
          usuarioId: newUser.id,
          nome: novoNome,
          email: novoEmail,
          areaAtuacao: novaArea,
          registroCrp: novoCrp || 'CRP 06/99999',
          situacao: 'Ativo'
        };
        setPsicologos([...psicologos, novoPsi]);
      }

      const novoLog: LogAuditoria = {
        id: Math.random().toString(),
        autor: 'Renata Farias (Admin)',
        acao: `Cadastrou o usuário ${novoNome} (${novoPerfil})`,
        dataHora: 'Agora mesmo'
      };
      setLogs([novoLog, ...logs]);

      showToast(`Usuário ${novoNome} criado com sucesso!`, 'success');
      setModalNovoOpen(false);
      setNovoNome('');
      setNovoEmail('');
      setNovoCrp('');
      await loadData();
    } catch (err: any) {
      showToast('Erro ao criar usuário.', 'danger');
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    return (
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.perfil.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const psicologosFiltrados = psicologos.filter((p) => {
    return (
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.areaAtuacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.registroCrp.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

const logsFiltrados = logs.filter((l) => {
    const matchText =
      l.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.autor.toLowerCase().includes(searchTerm.toLowerCase());

    if (tipoLogFilter === 'acesso') return matchText && (l.acao.toLowerCase().includes('login') || l.acao.toLowerCase().includes('acesso'));
    if (tipoLogFilter === 'cadastro') return matchText && (l.acao.toLowerCase().includes('cadastrou') || l.acao.toLowerCase().includes('criou'));
    if (tipoLogFilter === 'prontuario') return matchText && l.acao.toLowerCase().includes('prontuário');

    return matchText;
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
                  <th>Data e Hora</th>
                  <th>Autor da Ação</th>
                  <th>Descrição da Operação Registrada</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.map((l) => (
                  <tr key={l.id}>
                    <td className="text-nowrap small text-muted"><i className="bi bi-clock me-1"></i>{l.dataHora}</td>
                    <td><span className="fw-semibold text-primary">{l.autor}</span></td>
                    <td>{l.acao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalNovoOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-person-plus-fill me-2 text-primary"></i>Novo Usuário do Sistema</h5>
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
                      placeholder="Ex: Dr. Carlos Mendonça"
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
                      <option value="paciente">Paciente / Portal</option>
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