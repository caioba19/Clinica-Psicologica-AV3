import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { appointmentService } from '../../services/appointmentService';
import { Agendamento, TarefaTerapeutica } from '../../../../shared/src/types';
import { api } from '../../services/api';

interface ConsultaItem {
  id: string;
  data: string;
  hora: string;
  psicologo: string;
  tipo: string;
  modalidade: string;
  status: string;
}

export const PacientePortalPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sessoes, setSessoes] = useState<ConsultaItem[]>([]);
  const [totalRealizadas, setTotalRealizadas] = useState(0);
  const [loading, setLoading] = useState(false);

  const [tarefas, setTarefas] = useState<TarefaTerapeutica[]>([]);

  const loadDadosPaciente = async () => {
    try {
      setLoading(true);
      const agendamentos = await appointmentService.getMine();
      const mapped: ConsultaItem[] = agendamentos.map((a: Agendamento) => {
          const dt = a.inicio.includes('T') ? a.inicio.split('T')[0] : a.inicio;
          const [ano, mes, dia] = dt.split('-');
          const dataFmt = dia && mes ? `${dia}/${mes}/${ano}` : dt;
          const horaFmt = a.inicio.includes('T') ? a.inicio.split('T')[1].substring(0, 5) : '09:00';
          const isOnline = a.modalidade === 'online';

          return {
            id: a.id,
            data: dataFmt,
            hora: horaFmt,
            psicologo: a.psicologoNome || 'Profissional vinculado',
            tipo: a.tipo || 'Atendimento Psicológico',
            modalidade: isOnline ? 'Online (Google Meet)' : `Presencial (${a.sala || 'Sala 01'})`,
            status: a.status === 'realizado' ? 'Realizada' : a.status === 'confirmado' ? 'Confirmado' : 'Agendado'
          };
      });
      setSessoes(mapped);
      setTotalRealizadas(agendamentos.filter((appointment) => appointment.status === 'realizado').length);
    } catch (error: any) {
      setSessoes([]);
      setTotalRealizadas(0);
      showToast(error?.message || 'Não foi possível carregar suas consultas.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDadosPaciente();
    api.get<TarefaTerapeutica[]>('/tasks/my').then(setTarefas)
      .catch((error) => showToast(error.message || 'Não foi possível carregar suas atividades.', 'danger'));
  }, [user.id]);

  const toggleTarefa = async (task: TarefaTerapeutica) => {
    const concluida = !task.concluida;
    try {
      await api.patch(`/tasks/${task.id}/completion`, { concluida });
      setTarefas((prev) => prev.map((item) => item.id === task.id ? { ...item, concluida } : item));
    } catch (error: any) {
      showToast(error.message || 'Não foi possível atualizar a atividade.', 'danger');
    }
  };
  const proximaConsulta = sessoes.find((s) => s.status !== 'Realizada');

  return (
    <div>
      {/* Banner de Boas-Vindas do Paciente */}
      <div
        style={{
          background: 'linear-gradient(135deg, #173f4b 0%, #2c5f6e 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          color: '#fff',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <span className="badge badge-success mb-2">
            <i className="bi bi-shield-check me-1"></i> Área do Paciente • Espaço Seguro
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, margin: 0, color: '#fff' }}>
            Olá, {user.name}
          </h2>
          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.75)', margin: '6px 0 0' }}>
            Aqui você acompanha os atendimentos vinculados à sua conta.
          </p>
        </div>

        {proximaConsulta && (
          <div className="text-end d-none d-md-block">
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>Próxima Consulta</span>
            <strong style={{ fontSize: '16px', color: '#5cb8a8' }}>
              {proximaConsulta.data} às {proximaConsulta.hora}
            </strong>
          </div>
        )}
      </div>

      {/* Cards de Resumo para o Paciente */}
      <div className="grid-4 mb-24">
        <StatCard
          title="Próxima Sessão"
          value={proximaConsulta ? proximaConsulta.data : 'A definir'}
          change={proximaConsulta ? `${proximaConsulta.hora} (${proximaConsulta.modalidade.includes('Online') ? 'Online' : 'Presencial'})` : 'Aguardando agendamento'}
          changeType="up"
          icon="calendar-event"
          color="teal"
        />
        <StatCard
          title="Sessões Concluídas"
          value={totalRealizadas.toString()}
          change="Evolução contínua"
          changeType="up"
          icon="check-circle"
          color="green"
        />
        <StatCard
          title="Exercícios Terapêuticos"
          value={`${tarefas.filter((t) => !t.concluida).length} pendentes`}
          change="Atividades do seu acompanhamento"
          changeType="down"
          icon="journal-check"
          color="orange"
        />
        <StatCard
          title="Recibos & Faturas"
          value="Demonstrativo"
          change="Não consultado no banco"
          changeType="up"
          icon="receipt"
          color="blue"
        />
      </div>

      {/* Grid: Minhas Consultas & Atividades Entre Sessões */}
      <div className="grid-2 mb-24">
        {/* Próximos Atendimentos */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title">Minhas Consultas (Integradas à API)</h3>
            <button
              className="btn-accent"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => showToast('O reagendamento ainda precisa ser solicitado diretamente à clínica.', 'warning')}
            >
              <i className="bi bi-calendar-plus me-1"></i> Como reagendar?
            </button>
          </div>
          <div className="card-body">
            {loading && (
              <div className="text-center p-3 text-muted small">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Carregando consultas...
              </div>
            )}
            {!loading && sessoes.length === 0 && (
              <p className="text-muted mb-0">Não há consultas vinculadas à sua conta.</p>
            )}
            {sessoes.map((s) => (
              <div key={s.id} className="p-3 border rounded-3 mb-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>{s.data} às {s.hora}</strong>
                  <span className={`badge ${s.status === 'Confirmado' || s.status === 'Realizada' ? 'badge-success' : 'badge-primary'}`}>
                    {s.status}
                  </span>
                </div>
                <p className="mb-1 text-secondary small">
                  <strong>Psicóloga:</strong> {s.psicologo} • {s.tipo}
                </p>
                <p className="mb-2 text-muted small">
                  <strong>Modalidade:</strong> {s.modalidade}
                </p>

              </div>
            ))}
          </div>
        </div>

        {/* Exercícios e Tarefas Terapêuticas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Atividades entre sessões</h3>
          </div>
          <div className="card-body">
            {tarefas.length === 0 && <p className="text-muted mb-0">Nenhuma atividade foi atribuída.</p>}
            {tarefas.map((t) => (
              <div key={t.id} className="d-flex align-items-center gap-3 p-3 border-bottom">
                <div
                  onClick={() => toggleTarefa(t)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: t.concluida ? 'var(--accent)' : '#fff',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {t.concluida && <i className="bi bi-check"></i>}
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    onClick={() => toggleTarefa(t)}
                    style={{
                      fontSize: '13.5px',
                      textDecoration: t.concluida ? 'line-through' : 'none',
                      color: t.concluida ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {t.texto}
                  </span>
                </div>
                <button
                  className={`btn btn-sm ${t.concluida ? 'btn-ghost text-success' : 'btn-outline-primary'}`}
                  style={{ fontSize: '11px' }}
                  onClick={() => toggleTarefa(t)}
                >
                  {t.concluida ? 'Concluído' : 'Concluir'}
                </button>
              </div>
            ))}

            <div className="mt-4 p-3 bg-light rounded-3 border">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-shield-check text-success"></i>
                <strong style={{ fontSize: '13px' }}>Sigilo Profissional Garantido</strong>
              </div>
              <p className="text-muted small mb-0">
                Suas anotações são de acesso restrito e protegidas pelo Código de Ética Profissional do Psicólogo (CFP).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
