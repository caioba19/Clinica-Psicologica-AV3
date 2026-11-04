import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { Paciente, Agendamento } from '../../../../shared/src/types';

interface EventoAgenda {
  id: string;
  hora: string;
  duracao: string;
  paciente: string;
  tipo: string;
  sala: string;
  avatar: string;
  color: 'teal' | 'blue' | 'green' | 'orange' | 'red';
}

export const AgendaPage: React.FC = () => {
  const { showToast } = useToast();
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()));
  const selectedDay = Number(selectedDate.slice(-2));
  const [activeTab, setActiveTab] = useState<'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex'>('Seg');
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [loading, setLoading] = useState(false);

  const [pacientesList, setPacientesList] = useState<Paciente[]>([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState('');

  const [eventos, setEventos] = useState<EventoAgenda[]>([]);

  const [novoPaciente, setNovoPaciente] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [novoTipo, setNovoTipo] = useState('TCC • Presencial');
  const [novaSala, setNovaSala] = useState('Sala 01');

  const horasGrade = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const getDayDateString = (): string => selectedDate;

  const loadAgendamentos = async (tab: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex') => {
    try {
      setLoading(true);
      const dateStr = getDayDateString();
      const data: Agendamento[] = await appointmentService.getByDate(dateStr);
      const mapped: EventoAgenda[] = data.map((a) => {
          const initials = a.pacienteNome
            ? a.pacienteNome.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
            : 'PX';
          const time = a.inicio.includes('T') ? a.inicio.split('T')[1].substring(0, 5) : '09:00';
          const color: 'teal' | 'blue' | 'green' | 'orange' | 'red' =
            a.modalidade === 'online' ? 'green' : 'teal';

          return {
            id: a.id,
            hora: time,
            duracao: `${a.duracaoMinutos || 50} min`,
            paciente: a.pacienteNome,
            tipo: a.tipo,
            sala: a.sala || (a.modalidade === 'online' ? 'Google Meet' : 'Sala 01'),
            avatar: initials,
            color
          };
      });
      setEventos(mapped);
    } catch (error: any) {
      setEventos([]);
      showToast(error?.message || 'Não foi possível carregar a agenda.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    patientService.getAll().then((pats) => {
      setPacientesList(pats);
      if (pats.length > 0) {
        setSelectedPacienteId(pats[0].id);
        setNovoPaciente(pats[0].nome);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadAgendamentos(activeTab);
  }, [activeTab, selectedDate]);

  const handleTabChange = (dia: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex') => {
    setActiveTab(dia);
    const monday = new Date(`${selectedDate}T12:00:00`);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const offset: Record<typeof dia, number> = { Seg: 0, Ter: 1, Qua: 2, Qui: 3, Sex: 4 };
    monday.setDate(monday.getDate() + offset[dia]);
    setSelectedDate(formatDate(monday));
  };

  const handleCreateEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPaciente || !novaHora) {
      showToast('Preencha os campos obrigatórios.', 'warning');
      return;
    }

    const dateStr = getDayDateString();
    const inicioIso = `${dateStr}T${novaHora}`;
    const modalidade = novaSala.toLowerCase().includes('online') || novaSala.toLowerCase().includes('meet') ? 'online' : 'presencial';

    try {
      if (!selectedPacienteId || pacientesList.length === 0) {
        showToast('Cadastre ou vincule um paciente antes de agendar.', 'warning');
        return;
      }
      const pacId = selectedPacienteId;
      await appointmentService.create({
        pacienteId: pacId,
        inicio: inicioIso,
        duracaoMinutos: 50,
        tipo: novoTipo,
        modalidade,
        sala: novaSala
      });
      showToast(`Agendamento de ${novoPaciente} confirmado e salvo na API!`, 'success');
      await loadAgendamentos(activeTab);
    } catch (err: any) {
      showToast(err?.message || 'Não foi possível salvar o agendamento.', 'danger');
      return;
    }

    setModalOpen(false);
    setNovaHora('');
  };

  const [year, month] = selectedDate.split('-').map(Number);
  const diasMes = Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1);
  const primeiroDiaDoMes = new Date(year, month - 1, 1).getDay();
  const mesAno = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda Clínica</h1>
          <p className="page-subtitle">Gerencie suas sessões, horários disponíveis e atendimentos integrados à API</p>
        </div>
        <button className="btn-accent" onClick={() => setModalOpen(true)}>
          <i className="bi bi-calendar-plus me-1"></i> Nova Consulta
        </button>
      </div>

      <div className="agenda-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px', alignItems: 'start' }}>
        {/* Grade Horária */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex gap-1 p-1 rounded-3 border" style={{ background: 'var(--bg-card)' }}>
              {(['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] as const).map((dia) => (
                <button
                  key={dia}
                  type="button"
                  className={`btn btn-sm ${activeTab === dia ? 'btn-primary' : 'btn-ghost'} border-0`}
                  style={{ fontWeight: 600, fontSize: '12.5px' }}
                  onClick={() => handleTabChange(dia)}
                >
                  {dia}
                </button>
              ))}
            </div>

            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="presencial">Presencial</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {loading && (
                <div className="text-center p-3 text-muted small">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Atualizando agenda...
                </div>
              )}
              <div style={{ maxHeight: 'calc(100vh - 270px)', overflowY: 'auto' }}>
                {horasGrade.map((h) => {
                  const evs = eventos.filter((e) => {
                    const matchHora = e.hora.startsWith(h.substring(0, 2));
                    if (!matchHora) return false;
                    if (filtroTipo === 'presencial') return !e.tipo.toLowerCase().includes('online');
                    if (filtroTipo === 'online') return e.tipo.toLowerCase().includes('online');
                    return true;
                  });

                  return (
                    <div
                      key={h}
                      style={{
                        display: 'flex',
                        minHeight: '70px',
                        borderBottom: '1px solid var(--border)'
                      }}
                    >
                      <div
                        style={{
                          width: '70px',
                          padding: '12px 14px 0 0',
                          textAlign: 'right',
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          fontWeight: 600,
                          flexShrink: 0
                        }}
                      >
                        {h}
                      </div>
                      <div style={{ flex: 1, padding: '8px 12px', background: evs.length ? 'rgba(92,184,168,0.06)' : 'transparent' }}>
                        {evs.map((ev) => (
                          <div
                            key={ev.id}
                            style={{
                              background: 'rgba(92,184,168,0.12)',
                              borderLeft: '4px solid var(--accent)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              marginBottom: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="avatar-sm"
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  fontSize: '11px',
                                  backgroundColor: 'var(--primary)',
                                  color: '#fff',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700
                                }}
                              >
                                {ev.avatar}
                              </span>
                              <div>
                                <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>{ev.paciente}</strong>
                                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                  {ev.tipo} • <span className="badge" style={{ background: 'var(--bg-hover, rgba(0,0,0,0.08))', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px' }}>{ev.sala}</span>
                                </span>
                              </div>
                            </div>
                            <span className="badge badge-primary">{ev.duracao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mini Calendário Lateral */}
        <div className="card">
          <div className="card-header pb-2">
            <h2 className="card-title" style={{ fontSize: '15px' }}>{mesAno}</h2>
          </div>
          <div className="card-body p-3">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
              {Array.from({ length: primeiroDiaDoMes }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {diasMes.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    const date = new Date(year, month - 1, d);
                    setSelectedDate(formatDate(date));
                    const weekday = date.getDay();
                    const weekdayTab = (['', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex'] as const)[weekday];
                    if (weekdayTab) setActiveTab(weekdayTab);
                  }}
                  style={{
                    height: '32px',
                    borderRadius: '6px',
                    border: 'none',
                    background: d === selectedDay ? 'var(--primary)' : 'transparent',
                    color: d === selectedDay ? '#fff' : 'inherit',
                    fontWeight: d === selectedDay ? 700 : 400,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="border-top mt-3 pt-3">
              <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Consultas Confirmadas</span>
              {eventos.slice(0, 3).map((ev) => (
                <div key={ev.id} className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ background: 'var(--bg-body)', fontSize: '12px' }}>
                  <i className="bi bi-clock text-accent"></i>
                  <div>
                    <strong>{ev.hora}</strong> — {ev.paciente}
                    <div className="text-muted" style={{ fontSize: '11px' }}>{ev.tipo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nova Consulta */}
      {modalOpen && (
        <div className="modal-backdrop-custom open" onClick={() => setModalOpen(false)}>
          <div className="modal-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nova Consulta na Agenda</h2>
              <button className="action-btn" type="button" onClick={() => setModalOpen(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleCreateEvento}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Paciente Vinculado *</label>
                  {pacientesList.length > 0 ? (
                    <select
                      className="form-select"
                      value={selectedPacienteId}
                      onChange={(e) => {
                        setSelectedPacienteId(e.target.value);
                        const p = pacientesList.find((x) => x.id === e.target.value);
                        if (p) setNovoPaciente(p.nome);
                      }}
                      required
                    >
                      {pacientesList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} ({p.cpf})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="form-control-plaintext text-muted mb-0">Nenhum paciente vinculado disponível para agendamento.</p>
                  )}
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Horário *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={novaHora}
                      onChange={(e) => setNovaHora(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sala / Modalidade</label>
                    <select className="form-select" value={novaSala} onChange={(e) => setNovaSala(e.target.value)}>
                      <option value="Sala 01">Presencial - Sala 01</option>
                      <option value="Sala 02">Presencial - Sala 02</option>
                      <option value="Google Meet">Online (Google Meet)</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo de Atendimento</label>
                  <select className="form-select" value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)}>
                    <option value="TCC • Presencial">TCC • Presencial</option>
                    <option value="Psicanálise • Presencial">Psicanálise • Presencial</option>
                    <option value="TCC • Online">TCC • Online</option>
                    <option value="Avaliação Psicológica">Avaliação Psicológica</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-accent" disabled={loading || pacientesList.length === 0}>
                  <i className="bi bi-check-lg me-1"></i> Agendar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
