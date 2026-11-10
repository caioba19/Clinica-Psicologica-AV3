import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { useToast } from '../../context/ToastContext';

interface ReportSummary { sessoes: number; realizadas: number; taxaFrequencia: number; novosPacientes: number; receitaPaga: number; ticketMedio: number; presencial: number; online: number }

export const RelatoriosPage: React.FC = () => {
  const { showToast } = useToast();
  const [periodo, setPeriodo] = useState('mes');
  const [summary, setSummary] = useState<ReportSummary>({ sessoes: 0, realizadas: 0, taxaFrequencia: 0, novosPacientes: 0, receitaPaga: 0, ticketMedio: 0, presencial: 0, online: 0 });
  useEffect(() => { api.get<ReportSummary>(`/reports/summary?period=${periodo}`).then(setSummary).catch((error) => showToast(error.message || 'Não foi possível carregar os indicadores.', 'error')); }, [periodo]);

  const rankingDiagnosticos: Array<{rank:number;nome:string;total:number;percent:number;isTop:boolean}> = [];

  const handleExport = (tipo: string) => {
    if (tipo === 'PDF') {
      const cleanup = () => document.body.classList.remove('printing-report');
      document.body.classList.add('printing-report');
      window.addEventListener('afterprint', cleanup, { once: true });
      window.print();
      return;
    }
    const rows = [
      ['Indicador', 'Valor'],
      ['Período', periodo],
      ['Sessões', String(summary.sessoes)],
      ['Sessões realizadas', String(summary.realizadas)],
      ['Taxa de frequência', `${summary.taxaFrequencia}%`],
      ['Novos vínculos', String(summary.novosPacientes)],
      ['Receita paga', summary.receitaPaga.toFixed(2)],
      ['Média de receita por sessão realizada', summary.ticketMedio.toFixed(2)],
      ['Atendimentos presenciais', String(summary.presencial)],
      ['Atendimentos online', String(summary.online)]
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${periodo}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Relatório CSV baixado.', 'success');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios & Indicadores</h1>
          <p className="page-subtitle">Análises clínicas, volumetria de sessões e exportação de dados</p>
        </div>
        <div className="d-flex gap-2 report-export-actions">
          <button className="btn-ghost" onClick={() => handleExport('Excel/CSV')}>
            <i className="bi bi-file-earmark-spreadsheet me-1"></i> Exportar CSV
          </button>
          <button className="btn-accent" onClick={() => handleExport('PDF')}>
            <i className="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtro de Período */}
      <div className="card mb-4">
        <div className="card-body p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-secondary small">Período de Análise:</span>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${periodo === 'mes' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPeriodo('mes')}
              >
                Este Mês
              </button>
              <button
                type="button"
                className={`btn btn-sm ${periodo === 'trimestre' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPeriodo('trimestre')}
              >
                Último Trimestre
              </button>
              <button
                type="button"
                className={`btn btn-sm ${periodo === 'ano' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPeriodo('ano')}
              >
                Ano atual
              </button>
            </div>
          </div>
          <span className="text-muted small">Indicadores atualizados sob demanda</span>
        </div>
      </div>

      {/* Métricas do Período */}
      <div className="grid-4 mb-24">
        <StatCard
          title="Total de Sessões"
          value={String(summary.sessoes)}
          change={`${summary.realizadas} realizadas no período`}
          changeType="up"
          icon="journal-check"
          color="teal"
        />
        <StatCard
          title="Taxa de Frequência"
          value={`${summary.taxaFrequencia}%`}
          change="Realizadas sobre consultas não canceladas"
          changeType="up"
          icon="check2-all"
          color="green"
        />
        <StatCard
          title="Ticket Médio / Sessão"
          value={`R$ ${summary.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={`Receita paga: R$ ${summary.receitaPaga.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          changeType="up"
          icon="cash-stack"
          color="blue"
        />
        <StatCard
          title="Novos Pacientes"
          value={String(summary.novosPacientes)}
          change="Novos vínculos no período"
          changeType="up"
          icon="person-plus"
          color="orange"
        />
      </div>

      {/* Diagnósticos e Queixas Mais Frequentes */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Diagnósticos clínicos</h3>
          </div>
          <div className="card-body">
            {rankingDiagnosticos.length === 0 && <p className="text-muted">O sistema não registra diagnósticos para gerar este indicador.</p>}
            {rankingDiagnosticos.map((item) => (
              <div key={item.rank} className="d-flex align-items-center gap-3 py-3 border-bottom">
                <span
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: item.isTop ? 'var(--accent)' : 'var(--bg-main)',
                    color: item.isTop ? '#12343c' : 'var(--text-secondary)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}
                >
                  #{item.rank}
                </span>
                <div style={{ flex: 1 }}>
                  <strong className="d-block" style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{item.nome}</strong>
                  <div className="progress mt-1" style={{ height: '6px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${item.percent}%`, background: 'var(--accent)' }}
                    />
                  </div>
                </div>
                <div className="text-end">
                  <strong className="d-block" style={{ color: 'var(--text-primary)' }}>{item.total} pac.</strong>
                  <span className="text-muted small">{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo de Modalidade e Canais */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Distribuição por Modalidade de Atendimento</h3>
          </div>
          <div className="card-body">
            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-bold">Presencial (Clínica Física)</span>
                <strong>{summary.presencial} sessões ({summary.sessoes ? Math.round(summary.presencial / summary.sessoes * 100) : 0}%)</strong>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div className="progress-bar" style={{ width: `${summary.sessoes ? summary.presencial / summary.sessoes * 100 : 0}%`, background: 'var(--primary)' }}></div>
              </div>
            </div>

            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-bold">Online (Google Meet / Teleconsulta)</span>
                <strong>{summary.online} sessões ({summary.sessoes ? Math.round(summary.online / summary.sessoes * 100) : 0}%)</strong>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div className="progress-bar" style={{ width: `${summary.sessoes ? summary.online / summary.sessoes * 100 : 0}%`, background: 'var(--accent)' }}></div>
              </div>
            </div>

            <div className="mt-4 p-3 border rounded text-secondary small">
              <i className="bi bi-info-circle text-primary me-2"></i>
              Os números desta seção são calculados a partir dos agendamentos registrados no sistema.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
