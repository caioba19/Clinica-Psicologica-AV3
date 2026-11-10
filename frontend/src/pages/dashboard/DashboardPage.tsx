import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { Agendamento, LancamentoFinanceiro, Paciente, TarefaTerapeutica } from '../../../../shared/src/types';

const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const today = useMemo(() => localDate(new Date()), []);
  const [appointments, setAppointments] = useState<Agendamento[]>([]);
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [tasks, setTasks] = useState<TarefaTerapeutica[]>([]);
  const [finance, setFinance] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [taskText, setTaskText] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      appointmentService.getByDate(today),
      patientService.getAll(),
      api.get<TarefaTerapeutica[]>('/tasks'),
      api.get<LancamentoFinanceiro[]>('/finance')
    ]);
    if (results[0].status === 'fulfilled') setAppointments(results[0].value);
    else showToast('Não foi possível carregar a agenda de hoje.', 'danger');
    if (results[1].status === 'fulfilled') setPatients(results[1].value);
    else showToast('Não foi possível carregar os pacientes.', 'danger');
    if (results[2].status === 'fulfilled') setTasks(results[2].value);
    else showToast('Não foi possível carregar as tarefas.', 'danger');
    if (results[3].status === 'fulfilled') setFinance(results[3].value);
    else showToast('Não foi possível carregar o resumo financeiro.', 'danger');
    setLoading(false);
  };

  useEffect(() => { void loadDashboard(); }, [today]);

  const activePatients = patients.filter((patient) => patient.status === 'Ativo').length;
  const pendingTasks = tasks.filter((task) => !task.concluida);
  const monthlyRevenue = finance
    .filter((item) => item.tipo === 'receita' && item.status === 'Pago' && item.data.slice(0, 7) === today.slice(0, 7))
    .reduce((sum, item) => sum + item.valor, 0);
  const dateLabel = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${today}T12:00:00`));

  const createTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patientId || !taskText.trim()) return;
    setSavingTask(true);
    try {
      const task = await api.post<TarefaTerapeutica>('/tasks', { pacienteId: patientId, texto: taskText.trim() });
      setTasks((current) => [task, ...current]);
      setTaskText('');
      setTaskModalOpen(false);
      showToast('Atividade atribuída ao paciente.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Não foi possível atribuir a atividade.', 'danger');
    } finally {
      setSavingTask(false);
    }
  };

  return (
    <div>
      <div className="welcome-banner" style={{
        background: 'linear-gradient(135deg, var(--bg-sidebar) 0%, var(--primary) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '28px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '28px', color: '#fff', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <span className="badge mb-2" style={{ background: 'rgba(92,184,168,.2)', color: '#b8e3dc' }}>Painel da clínica</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: '#fff' }}>Olá, {user.name}</h2>
          <p style={{ color: 'rgba(255,255,255,.75)', margin: 0 }}>{dateLabel} · {appointments.length} atendimento(s) na agenda</p>
        </div>
        <Link to="/agenda" className="btn-accent">Abrir agenda</Link>
      </div>

      <div className="grid-4 mb-24">
        <StatCard title="Atendimentos hoje" value={String(appointments.length)} change={`${appointments.filter((item) => item.status === 'confirmado').length} confirmados`} changeType="up" icon="calendar-check" color="teal" />
        <StatCard title="Pacientes ativos" value={String(activePatients)} change="Vínculos ativos disponíveis" changeType="up" icon="people" color="blue" />
        <StatCard title="Receitas pagas no mês" value={`R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} change="Soma dos lançamentos pagos" changeType="up" icon="currency-dollar" color="green" />
        <StatCard title="Atividades pendentes" value={String(pendingTasks.length)} change="Atribuídas aos pacientes" changeType="down" icon="journal-text" color="orange" />
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title">Agenda de hoje</h3>
            <Link to="/agenda" className="btn-ghost">Ver agenda completa</Link>
          </div>
          <div className="card-body">
            {loading && <p className="text-muted">Carregando agenda...</p>}
            {!loading && appointments.length === 0 && <p className="text-muted mb-0">Nenhum atendimento agendado para hoje.</p>}
            {appointments.map((appointment) => {
              const time = appointment.inicio.includes('T') ? appointment.inicio.split('T')[1].slice(0, 5) : '';
              return <div key={appointment.id} className="d-flex align-items-center gap-3 py-3 border-bottom">
                <strong className="text-primary">{time}</strong>
                <div className="flex-grow-1 min-w-0">
                  <strong className="d-block">{appointment.pacienteNome}</strong>
                  <span className="small text-muted">{appointment.tipo} · {appointment.modalidade === 'online' ? 'Online' : appointment.sala || 'Presencial'}</span>
                </div>
                <span className="badge badge-ghost">{appointment.status}</span>
              </div>;
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title">Atividades dos pacientes</h3>
            <button className="btn-accent" type="button" onClick={() => setTaskModalOpen(true)}>Atribuir atividade</button>
          </div>
          <div className="card-body">
            {loading && <p className="text-muted">Carregando atividades...</p>}
            {!loading && tasks.length === 0 && <p className="text-muted mb-0">Nenhuma atividade atribuída ainda.</p>}
            {tasks.slice(0, 6).map((task) => {
              const patient = patients.find((item) => item.id === task.pacienteId);
              return <div key={task.id} className="d-flex align-items-start gap-3 py-3 border-bottom">
                <i className={`bi ${task.concluida ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} mt-1`}></i>
                <div className="flex-grow-1">
                  <strong className="d-block">{task.texto}</strong>
                  <span className="small text-muted">{patient?.nome || 'Paciente'} · {task.concluida ? 'Concluída' : 'Pendente'}</span>
                </div>
              </div>;
            })}
          </div>
        </div>
      </div>

      {taskModalOpen && <div className="modal-backdrop-custom open" onClick={() => setTaskModalOpen(false)}>
        <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header"><h2 className="modal-title" id="task-modal-title">Atribuir atividade terapêutica</h2><button className="action-btn" type="button" onClick={() => setTaskModalOpen(false)} aria-label="Fechar">×</button></div>
          <form onSubmit={createTask}>
            <div className="modal-body">
              <label className="form-label" htmlFor="task-patient">Paciente</label>
              <select id="task-patient" className="form-select mb-3" value={patientId} onChange={(event) => setPatientId(event.target.value)} required>
                <option value="">Selecione um paciente</option>
                {patients.filter((patient) => patient.status === 'Ativo').map((patient) => <option key={patient.id} value={patient.id}>{patient.nome}</option>)}
              </select>
              <label className="form-label" htmlFor="task-description">Atividade</label>
              <textarea id="task-description" className="form-control" rows={4} maxLength={240} value={taskText} onChange={(event) => setTaskText(event.target.value)} required />
              <small className="text-muted">Até 240 caracteres.</small>
            </div>
            <div className="modal-footer"><button className="btn-ghost" type="button" onClick={() => setTaskModalOpen(false)}>Cancelar</button><button className="btn-accent" type="submit" disabled={savingTask || patients.filter((patient) => patient.status === 'Ativo').length === 0}>{savingTask ? 'Salvando...' : 'Atribuir atividade'}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
};
