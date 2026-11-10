import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export const ParaEmpresasPage: React.FC = () => {
  const { showToast } = useToast();
  const [empresa, setEmpresa] = useState('');
  const [colaboradores, setColaboradores] = useState('50-200');
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');

  const handleSolicitarProposta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !email || !nome) {
      showToast('Por favor, preencha todos os campos obrigatórios (*)', 'warning');
      return;
    }
    showToast(`Obrigado, ${nome}! Entraremos em contato com a proposta para a ${empresa}.`, 'success');
    setEmpresa('');
    setEmail('');
    setNome('');
  };

  const pilares = [
    {
      icon: 'bi-heart-pulse',
      titulo: 'Prevenção ao Burnout e Estresse',
      descricao: 'Acompanhamento preventivo e contínuo com psicólogos credenciados para identificar sinais de exaustão precoce.'
    },
    {
      icon: 'bi-bar-chart-line',
      titulo: 'Dashboard & Indicadores de Clima para o RH',
      descricao: 'Relatórios agregados e 100% anônimos de utilização, satisfação e índices de adesão, sem ferir o sigilo médico individual.'
    },
    {
      icon: 'bi-shield-check',
      titulo: 'Sigilo e Conformidade com o CFP',
      descricao: 'Garantia legal e ética de confidencialidade dos prontuários e registros de sessão, em total alinhamento com a LGPD.'
    },
    {
      icon: 'bi-people',
      titulo: 'Retenção de Talentos & Engajamento',
      descricao: 'Empresas com programas de suporte emocional estruturado reduzem o turnover voluntário em mais de 38%.'
    }
  ];

  const passos = [
    { passo: '01', titulo: 'Diagnóstico de Necessidades', desc: 'Mapeamento do perfil da sua equipe e definição dos objetivos do benefício de saúde mental.' },
    { passo: '02', titulo: 'Onboarding & Acolhimento', desc: 'Apresentação da plataforma aos colaboradores com ativação simplificada e triagem inicial.' },
    { passo: '03', titulo: 'Atendimento & Sessões', desc: 'Consultas online e presenciais agendadas com liberdade de escolha do profissional pelo colaborador.' },
    { passo: '04', titulo: 'Acompanhamento Mensal', desc: 'Envio de relatórios consolidados de impacto e engajamento para a gestão de Recursos Humanos.' }
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
          <Link to="/para-psicologos" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Para psicólogos</Link>
          <Link to="/para-empresas" style={{ color: '#5cb8a8', textDecoration: 'none', fontWeight: 700 }}>Para empresas</Link>
          <Link to="/blog" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Blog</Link>
        </nav>

        <Link to="/login" style={{ background: '#5cb8a8', color: '#12343c', padding: '8px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px' }}>
          Entrar
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '60px 24px', maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: '#5cb8a8', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Saúde Mental Corporativa & Bem-Estar
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '8px', marginBottom: '16px', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
            O Benefício de Saúde Mental que Transforma Empresas
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', maxWidth: '720px', margin: '0 auto', fontSize: '15.5px', lineHeight: 1.7 }}>
            Reduza o absenteísmo e construa um ambiente psicologicamente seguro com acesso simplificado a psicólogos qualificados e relatórios anônimos de acompanhamento para o RH.
          </p>
        </div>

        {/* Métricas de Impacto */}
        <div className="row g-3 mb-5 text-center">
          <div className="col-6 col-md-3">
            <div style={{ backgroundColor: '#12262d', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#5cb8a8' }}>4x</div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Retorno sobre investimento (ROI)</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div style={{ backgroundColor: '#12262d', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#5cb8a8' }}>-45%</div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Redução de afastamentos por estresse</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div style={{ backgroundColor: '#12262d', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#5cb8a8' }}>92%</div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Aprovação dos colaboradores</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div style={{ backgroundColor: '#12262d', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#5cb8a8' }}>100%</div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Conformidade com CFP & LGPD</div>
            </div>
          </div>
        </div>

        {/* Pilares do Programa */}
        <div className="row g-4 mb-5">
          {pilares.map((p, i) => (
            <div key={i} className="col-md-6">
              <div style={{ backgroundColor: '#12262d', borderRadius: '14px', padding: '24px', height: '100%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(92,184,168,0.2)', color: '#5cb8a8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  <i className={`bi ${p.icon}`}></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{p.titulo}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>{p.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Etapas de Implantação e Formulário de Contato */}
        <div className="row g-4 mb-5 align-items-center">
          <div className="col-lg-6">
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>
              Como implantar na sua empresa?
            </h2>
            <div className="d-flex flex-column gap-3">
              {passos.map((p, i) => (
                <div key={i} className="d-flex gap-3">
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(92,184,168,0.2)', color: '#5cb8a8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>
                    {p.passo}
                  </span>
                  <div>
                    <strong style={{ fontSize: '14.5px', color: '#fff', display: 'block' }}>{p.titulo}</strong>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-6">
            <div style={{ backgroundColor: '#12262d', borderRadius: '16px', padding: '32px', border: '1px solid rgba(92, 184, 168, 0.3)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Solicite uma Proposta Corporativa</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginBottom: '20px' }}>Descubra como estruturar o benefício para seu time.</p>
              
              <form onSubmit={handleSolicitarProposta}>
                <div className="mb-3">
                  <label className="form-label text-white" style={{ fontSize: '12.5px' }}>Seu Nome *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Carlos Eduardo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white" style={{ fontSize: '12.5px' }}>Nome da Empresa *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Tech Solutions Brasil"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    required
                  />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-white" style={{ fontSize: '12.5px' }}>E-mail Corporativo *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="carlos@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-white" style={{ fontSize: '12.5px' }}>Nº de Colaboradores</label>
                    <select
                      className="form-select"
                      value={colaboradores}
                      onChange={(e) => setColaboradores(e.target.value)}
                    >
                      <option value="1-50">1 a 50 colaboradores</option>
                      <option value="50-200">51 a 200 colaboradores</option>
                      <option value="200-1000">201 a 1.000 colaboradores</option>
                      <option value="1000+">Mais de 1.000 colaboradores</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-accent w-100 py-2"
                  style={{ background: '#5cb8a8', color: '#12343c', fontWeight: 700, border: 'none' }}
                >
                  <i className="bi bi-send me-1"></i> Solicitar Apresentação Técnica
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
