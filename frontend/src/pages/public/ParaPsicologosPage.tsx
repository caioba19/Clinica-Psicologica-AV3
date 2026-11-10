import React from 'react';
import { Link } from 'react-router-dom';

export const ParaPsicologosPage: React.FC = () => {
  const recursos = [
    {
      titulo: 'Prontuário Eletrônico & Evoluções (CFP)',
      descricao: 'Registro ágil de sessões com conformidade integral à Resolução CFP nº 01/2009. Criptografia ponta a ponta e histórico acessível.',
      icon: 'bi-journal-medical',
      tag: 'Ética & Segurança'
    },
    {
      titulo: 'Agenda Inteligente Anti-Faltas',
      descricao: 'Disparo de lembretes e confirmações automáticas com controle de status (Confirmado, Pendente, Cancelado). Redução de faltas em até 75%.',
      icon: 'bi-calendar3',
      tag: 'Produtividade'
    },
    {
      titulo: 'Gestão Financeira & Recibos com 1 Clique',
      descricao: 'Controle de pagamentos via PIX, cartões ou convênio. Emissão simplificada de recibos de honorários para declaração de imposto de renda.',
      icon: 'bi-cash-coin',
      tag: 'Financeiro'
    },
    {
      titulo: 'Teleconsulta Integrada e Estável',
      descricao: 'Salas virtuais criptografadas ponta-a-ponto com link único gerado automaticamente, sem complicação para seus pacientes.',
      icon: 'bi-camera-video',
      tag: 'Telepsicologia'
    },
    {
      titulo: 'Anamneses e Testes Configurados',
      descricao: 'Estruture roteiros de avaliação inicial por abordagem: TCC, Psicanálise, Humanista, Psicologia Infantil e Avaliação Neuropsicológica.',
      icon: 'bi-file-earmark-medical',
      tag: 'Clínica'
    },
    {
      titulo: 'Portal Exclusivo para Pacientes',
      descricao: 'Área segura para o paciente visualizar horários de sessão, links de atendimento e registros de atividades terapêuticas diárias.',
      icon: 'bi-person-check',
      tag: 'Experiência'
    }
  ];

  const comparativo = [
    { criterio: 'Segurança dos Dados', manual: 'Planilhas e anotações vulneráveis a vazamentos', psico: 'Criptografia AES-256 e logs de auditoria' },
    { criterio: 'Confirmação de Sessões', manual: 'Envio manual de mensagens individuais', psico: 'Lembretes e confirmações automáticas' },
    { criterio: 'Registro de Evoluções', manual: 'Papéis dispersos e desorganizados', psico: 'Modelos padronizados no padrão CFP' },
    { criterio: 'Controle Financeiro', manual: 'Controle manual e risco de inadimplência', psico: 'Dashboard em tempo real com emissão de recibos' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#173f4b', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#FFFFFF' }}>
          <img
            src="/logo-icon.png"
            alt="PsicoManager Logo"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(92,184,168,0.25)'
            }}
          />
          <span style={{ fontSize: '21px', fontWeight: 800 }}>Psico<span style={{ color: '#5cb8a8' }}>Manager</span></span>
        </Link>

        <nav className="d-none d-md-flex align-items-center gap-4" style={{ fontSize: '14px', fontWeight: 500 }}>
          <Link to="/como-funciona" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Como funciona</Link>
          <Link to="/para-psicologos" style={{ color: '#5cb8a8', textDecoration: 'none', fontWeight: 700 }}>Para psicólogos</Link>
          <Link to="/para-empresas" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Para empresas</Link>
          <Link to="/blog" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Blog</Link>
        </nav>

        <Link to="/login" style={{ background: '#5cb8a8', color: '#12343c', padding: '8px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px' }}>
          Entrar
        </Link>
      </header>

      {/* Main Hero & Content */}
      <main style={{ flex: 1, padding: '60px 24px', maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: '#5cb8a8', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Autonomia & Eficiência Clínica
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '8px', marginBottom: '16px', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
            A Plataforma Completa Feita para a Prática Psicológica
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', maxWidth: '720px', margin: '0 auto', fontSize: '15.5px', lineHeight: 1.7 }}>
            Economize até <strong>8 horas semanais</strong> com automação de agendamentos, prontuários padronizados e controle financeiro, dedicando seu tempo ao que realmente importa: o cuidado com seus pacientes.
          </p>
        </div>

        {/* Grade de Recursos */}
        <div className="row g-4 mb-5">
          {recursos.map((r, i) => (
            <div key={i} className="col-md-6 col-lg-4">
              <div
                style={{
                  backgroundColor: '#12262d',
                  borderRadius: '14px',
                  padding: '24px',
                  height: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(92, 184, 168, 0.18)',
                      color: '#5cb8a8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}
                  >
                    <i className={`bi ${r.icon}`}></i>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#5cb8a8', background: 'rgba(92,184,168,0.12)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {r.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  {r.titulo}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, margin: 0 }}>
                  {r.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabela Comparativa */}
        <div style={{ backgroundColor: '#12262d', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
            Por que migrar para o PsicoManager?
          </h2>
          <div className="table-responsive">
            <table className="table table-dark table-borderless align-middle mb-0" style={{ backgroundColor: 'transparent', margin: 0 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'transparent' }}>
                  <th style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', textTransform: 'uppercase', background: 'transparent' }}>Funcionalidade</th>
                  <th style={{ padding: '14px 16px', color: '#ff7b7b', fontSize: '12px', textTransform: 'uppercase', background: 'transparent' }}>Métodos Manuais / Planilhas</th>
                  <th style={{ padding: '14px 16px', color: '#5cb8a8', fontSize: '12px', textTransform: 'uppercase', background: 'transparent' }}>Com o PsicoManager</th>
                </tr>
              </thead>
              <tbody>
                {comparativo.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'transparent' }}>
                    <td style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: '#ffffff', background: 'transparent' }}>{c.criterio}</td>
                    <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', background: 'transparent' }}>
                      <i className="bi bi-x-circle text-danger me-2"></i>{c.manual}
                    </td>
                    <td style={{ padding: '16px', color: '#b8e3dc', fontSize: '13px', fontWeight: 600, background: 'transparent' }}>
                      <i className="bi bi-check-circle-fill text-success me-2"></i>{c.psico}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ background: '#5cb8a8', color: '#12343c', padding: '14px 36px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'inline-block', boxShadow: '0 8px 24px rgba(92,184,168,0.25)' }}>
            Acessar Painel do Psicólogo
          </Link>
        </div>
      </main>
    </div>
  );
};
