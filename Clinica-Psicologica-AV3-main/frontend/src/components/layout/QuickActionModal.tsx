import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [paciente, setPaciente] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [tipo, setTipo] = useState('Individual');
  const [sala, setSala] = useState('Sala 01');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paciente || !data || !hora) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }
    showToast(`Agendamento de ${paciente} criado com sucesso!`, 'success');
    onClose();
    setPaciente('');
    setData('');
    setHora('');
  };

  return (
    <div className="modal-backdrop-custom open" onClick={onClose}>
      <div className="modal-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Novo Agendamento Rápido</h2>
          <button className="action-btn" type="button" aria-label="Fechar" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Paciente *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nome do paciente"
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                required
              />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Data *</label>
                <input
                  type="date"
                  className="form-control"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Horário *</label>
                <input
                  type="time"
                  className="form-control"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Modalidade / Tipo</label>
                <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="Individual">Individual (Presencial)</option>
                  <option value="Online">Online / Teleconsulta</option>
                  <option value="Casal">Terapia de Casal</option>
                  <option value="Infantil">Infantil</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Sala de Atendimento</label>
                <select className="form-select" value={sala} onChange={(e) => setSala(e.target.value)}>
                  <option value="Sala 01">Sala 01 - Principal</option>
                  <option value="Sala 02">Sala 02 - Terapia Breve</option>
                  <option value="Online">Sala Virtual Google Meet</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-accent">
              <i className="bi bi-calendar-plus me-1"></i> Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
