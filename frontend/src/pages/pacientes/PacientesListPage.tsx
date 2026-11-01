import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Paciente } from '../../../../shared/src/types';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/common/EmptyState';
import { patientService } from '../../services/patientService';

export const PacientesListPage: React.FC = () => {
  const { showToast, confirmAction } = useToast();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAll();
      setPacientes(data);
    } catch (err: any) {
      showToast('Erro ao carregar lista de pacientes.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPacientes();
  }, []);

  const handleDeletePaciente = (id: string, nome: string) => {
    confirmAction(`Deseja realmente inativar o cadastro de ${nome}?`, async () => {
      try {
        await patientService.inactivate(id);
        await loadPacientes();
        showToast(`Paciente ${nome} inativado com sucesso.`, 'success');
        if (selectedPaciente?.id === id) setSelectedPaciente(null);
      } catch (err: any) {
        showToast('Erro ao inativar paciente.', 'danger');
      }
    });
  };

  const handleExportCSV = () => {
    if (pacientes.length === 0) {
      showToast('Não há pacientes para exportar.', 'warning');
      return;
    }

    const headers = 'Nome;CPF;E-mail;Telefone;Convênio;Status;Total Sessões;Última Sessão\n';
    const rows = pacientes
      .map((p) => `"${p.nome}";"${p.cpf}";"${p.email}";"${p.telefone}";"${p.convenio}";"${p.status}";"${p.totalSessoes}";"${p.ultimaSessao}"`)
      .join('\n');

    const blob = new Blob([`\uFEFF${headers}${rows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_pacientes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Relatório de pacientes exportado em CSV!', 'success');
  };

  const filteredPacientes = pacientes.filter((p) => {
    const matchText =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cpf.includes(search) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchText && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">Gerenciamento e prontuários de pacientes cadastrados</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-ghost" onClick={handleExportCSV} title="Exportar CSV">
            <i className="bi bi-download me-1"></i> Exportar CSV
          </button>
          <Link to="/pacientes/novo" className="btn-accent">
            <i className="bi bi-person-plus me-1"></i> Novo Paciente
          </Link>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="card mb-4">
        <div className="card-body p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '450px' }}>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar por nome, CPF ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="todos">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="em espera">Em Espera</option>
              <option value="inativo">Inativos</option>
            </select>

            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('table')}
                title="Visualização em Tabela"
              >
                <i className="bi bi-list-ul"></i>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('grid')}
                title="Visualização em Cards"
              >
                <i className="bi bi-grid-3x3-gap"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {loading ? (
        <div className="card p-5 text-center">
          <div className="spinner-border text-primary mx-auto mb-3" role="status"></div>
          <p className="text-muted">Carregando lista de pacientes...</p>
        </div>
      ) : filteredPacientes.length === 0 ? (
        <div className="card p-4">
          <EmptyState
            icon="bi-people"
            title="Nenhum paciente encontrado"
            description={search ? 'Tente ajustar os termos da sua busca.' : 'Cadastre seu primeiro paciente para iniciar o acompanhamento.'}
            action={
              <Link to="/pacientes/novo" className="btn-accent">
                <i className="bi bi-person-plus me-1"></i> Cadastrar Paciente
              </Link>
            }
          />
        </div>
      ) : viewMode === 'table' ? (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: '220px' }}>Paciente</th>
                  <th>Contato</th>
                  <th>Convênio</th>
                  <th>Status</th>
                  <th>Sessões</th>
                  <th>Próxima Sessão</th>
                  <th className="text-end" style={{ minWidth: '130px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.map((paciente) => (
                  <tr key={paciente.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: paciente.avatarColor || '#2b6cb0',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '14px'
                          }}
                        >
                          {paciente.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span
                            className="fw-bold d-block text-decoration-none"
                            style={{ cursor: 'pointer', color: 'var(--primary)' }}
                            onClick={() => setSelectedPaciente(paciente)}
                          >
                            {paciente.nome}
                          </span>
                          <span className="text-muted small">CPF: {paciente.cpf}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        <div><i className="bi bi-envelope me-1 text-muted"></i>{paciente.email}</div>
                        <div><i className="bi bi-whatsapp me-1 text-success"></i>{paciente.telefone}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{paciente.convenio}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          paciente.status === 'Ativo'
                            ? 'bg-success-subtle text-success border border-success'
                            : paciente.status === 'Em Espera'
                            ? 'bg-warning-subtle text-warning border border-warning'
                            : 'bg-secondary-subtle text-secondary border border-secondary'
                        }`}
                      >
                        {paciente.status}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold">{paciente.totalSessoes}</span>
                      <span className="text-muted small d-block">Última: {paciente.ultimaSessao}</span>
                    </td>
                    <td>
                      <span className="small text-muted">{paciente.proximaSessao || 'Não agendado'}</span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setSelectedPaciente(paciente)}
                          title="Ver Detalhes e Prontuário"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <Link
                          to={`/pacientes/${paciente.id}/editar`}
                          className="btn btn-outline-secondary"
                          title="Editar Cadastro"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeletePaciente(paciente.id, paciente.nome)}
                          title="Inativar Paciente"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filteredPacientes.map((paciente) => (
            <div key={paciente.id} className="col-md-6 col-lg-4">
              <div className="card h-100 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: paciente.avatarColor || '#2b6cb0',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600
                      }}
                    >
                      {paciente.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`badge ${
                        paciente.status === 'Ativo'
                          ? 'bg-success-subtle text-success border border-success'
                          : paciente.status === 'Em Espera'
                          ? 'bg-warning-subtle text-warning border border-warning'
                          : 'bg-secondary-subtle text-secondary border border-secondary'
                      }`}
                    >
                      {paciente.status}
                    </span>
                  </div>

                  <h5 className="mb-1" style={{ cursor: 'pointer' }} onClick={() => setSelectedPaciente(paciente)}>
                    {paciente.nome}
                  </h5>
                  <p className="text-muted small mb-2">CPF: {paciente.cpf}</p>
                  <p className="small mb-1"><i className="bi bi-envelope me-1 text-muted"></i>{paciente.email}</p>
                  <p className="small mb-2"><i className="bi bi-whatsapp me-1 text-success"></i>{paciente.telefone}</p>

                  <div className="p-2 bg-light rounded small mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Convênio:</span>
                      <strong>{paciente.convenio}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Total de Sessões:</span>
                      <strong>{paciente.totalSessoes}</strong>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <button className="btn btn-sm btn-ghost" onClick={() => setSelectedPaciente(paciente)}>
                    <i className="bi bi-file-earmark-medical me-1"></i> Prontuário
                  </button>
                  <div className="btn-group btn-group-sm">
                    <Link to={`/pacientes/${paciente.id}/editar`} className="btn btn-outline-secondary">
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleDeletePaciente(paciente.id, paciente.nome)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes / Prontuário Rápido */}
      {selectedPaciente && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          onClick={() => setSelectedPaciente(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      backgroundColor: selectedPaciente.avatarColor || '#2b6cb0',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}
                  >
                    {selectedPaciente.nome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">{selectedPaciente.nome}</h5>
                    <span className="text-muted small">CPF: {selectedPaciente.cpf} • {selectedPaciente.convenio}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedPaciente(null)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <h6 className="fw-bold mb-2"><i className="bi bi-telephone me-2 text-primary"></i>Contatos</h6>
                      <p className="mb-1 small"><strong>E-mail:</strong> {selectedPaciente.email}</p>
                      <p className="mb-1 small"><strong>Telefone:</strong> {selectedPaciente.telefone}</p>
                      <p className="mb-0 small"><strong>Nascimento:</strong> {selectedPaciente.dataNasc}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <h6 className="fw-bold mb-2"><i className="bi bi-clock-history me-2 text-primary"></i>Acompanhamento</h6>
                      <p className="mb-1 small"><strong>Status Clínico:</strong> {selectedPaciente.status}</p>
                      <p className="mb-1 small"><strong>Total de Sessões:</strong> {selectedPaciente.totalSessoes}</p>
                      <p className="mb-0 small"><strong>Próxima Sessão:</strong> {selectedPaciente.proximaSessao || 'Não agendado'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold"><i className="bi bi-chat-left-dots me-2 text-primary"></i>Motivo da Consulta</h6>
                  <div className="p-3 border rounded bg-white small">
                    {selectedPaciente.motivoConsulta || 'Nenhum motivo registrado até o momento.'}
                  </div>
                </div>

                <div>
                  <h6 className="fw-bold"><i className="bi bi-journal-medical me-2 text-primary"></i>Histórico e Anotações Clínicas</h6>
                  <div className="p-3 border rounded bg-white small">
                    {selectedPaciente.historico || 'Sem anotações clínicas registradas.'}
                  </div>
                </div>
              </div>

              <div className="modal-footer d-flex justify-content-between">
                <Link
                  to={`/pacientes/${selectedPaciente.id}/editar`}
                  className="btn-ghost"
                  onClick={() => setSelectedPaciente(null)}
                >
                  <i className="bi bi-pencil me-1"></i> Editar Dados Cadastrais
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedPaciente(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
