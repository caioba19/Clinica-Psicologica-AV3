import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ComoFuncionaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'paciente' | 'psicologo'>('paciente');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stepsPaciente = [
    {
      num: 1,
      title: 'Triagem & Seleção por Especialidade',
      desc: 'Encontre psicólogos qualificados filtrando por abordagem (TCC, Psicanálise, Humanista), queixa principal ou modalidade (online/presencial).',
      icon: 'bi-search'
    },
    {
      num: 2,
      title: 'Agendamento Simples e Flexível',
      desc: 'Visualize a disponibilidade em tempo real na grade do profissional, selecione o melhor horário e receba confirmação instantânea com lembrete no WhatsApp.',
      icon: 'bi-calendar-check'
    },
    {
      num: 3,
      title: 'Sessão Segura & Sala Criptografada',
      desc: 'Acesse teleconsultas em salas virtuais ponto a ponto de alta estabilidade ou compareça ao consultório com acolhimento garantido.',
      icon: 'bi-camera-video'
    },
    {
      num: 4,
      title: 'Acompanhamento & Espaço do Paciente',
      desc: 'Acesse materiais complementares, anotações de evolução, comprovantes de pagamento e tarefas terapêuticas em seu portal exclusivo.',
      icon: 'bi-shield-check'
    }
  ];

  const stepsPsicologo = [
    {
      num: 1,
      title: 'Cadastro & Validação com o CRP',
      desc: 'Crie seu perfil profissional com registro ativo no Conselho Regional de Psicologia, definindo horários, valor de sessão e especialidades.',
      icon: 'bi-person-badge'
    },
    {
      num: 2,
      title: 'Prontuário Eletrônico em Conformidade CFP',
      desc: 'Registre evoluções, laudos e anamneses em modelos padronizados pelo CFP (Resolução 01/2009) com criptografia AES-256 de nível bancário.',
      icon: 'bi-journal-medical'
    },
    {
      num: 3,
      title: 'Agenda Inteligente Anti-Faltas',
      desc: 'Reduza faltas e cancelamentos de última hora com disparo de lembretes automáticos e controle de remarcações simplificado.',
      icon: 'bi-clock-history'
    },
    {
      num: 4,
      title: 'Gestão Financeira & Recibos Automáticos',
      desc: 'Controle entradas, recebimentos via PIX, gere recibos de honorários com 1 clique e acompanhe o faturamento mensal da clínica.',
      icon: 'bi-cash-coin'
    }
  ];

  const faqs = [
    {
      q: 'Como funciona o sigilo e a privacidade dos prontuários?',
      a: 'Todos os prontuários, registros de anamnese e evoluções de sessão são protegidos com criptografia de ponta a ponta. Apenas o psicólogo responsável pelo atendimento e os usuários expressamente autorizados têm acesso aos dados, atendendo integralmente à LGPD e ao Código de Ética do CFP.'
    },
    {
      q: 'Como são realizadas as sessões online?',
      a: 'As teleconsultas ocorrem em salas virtuais seguras integradas diretamente ao agendamento. Tanto o psicólogo quanto o paciente recebem o link de acesso com botão de entrada direto, sem necessidade de baixar softwares pesados.'
    },
    {
      q: 'A plataforma emite recibos para reembolso de plano de saúde?',
      a: 'Sim. O psicólogo pode emitir recibos e declarações de comparecimento personalizadas com seu nome, CPF/CNPJ e número de registro no CRP com apenas um clique.'
    },
    {
      q: 'Posso utilizar o sistema em mais de um dispositivo?',
      a: 'Sim. O PsicoManager é 100% responsivo e funciona em computadores, notebooks, tablets e smartphones com sincronização em tempo real.'
    }
  ];

  const currentSteps = activeTab === 'paciente' ? stepsPaciente : stepsPsicologo;

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
          <Link to="/como-funciona" style={{ color: '#5cb8a8', textDecoration: 'none', fontWeight: 700 }}>Como funciona</Link>
          <Link to="/para-psicologos" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Para psicólogos</Link>
          <Link to="/para-empresas" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Para empresas</Link>
          <Link to="/blog" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Blog</Link>
        </nav>

        <div className="d-flex align-items-center gap-3">
          <Link to="/login" style={{ background: '#5cb8a8', color: '#12343c', padding: '8px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px' }}>
            Entrar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '60px 24px', maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: '#5cb8a8', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Plataforma Integrada de Saúde Mental
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '8px', marginBottom: '16px', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
            Como o PsicoManager Funciona?
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', maxWidth: '680px', margin: '0 auto', fontSize: '15.5px', lineHeight: 1.7 }}>
            Uma solução completa e intuitiva desenvolvida para conectar pacientes e profissionais com total segurança ética, prontuário integrado e praticidade.
          </p>

          {/* Seletor de Abas da Jornada */}
          <div className="d-inline-flex p-1 mt-4" style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('paciente')}
              style={{
                background: activeTab === 'paciente' ? '#5cb8a8' : 'transparent',
                color: activeTab === 'paciente' ? '#12343c' : '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="bi bi-person me-2"></i> Jornada do Paciente
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('psicologo')}
              style={{
                background: activeTab === 'psicologo' ? '#5cb8a8' : 'transparent',
                color: activeTab === 'psicologo' ? '#12343c' : '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="bi bi-person-badge me-2"></i> Jornada do Psicólogo
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="row g-4 mb-5">
          {currentSteps.map((s) => (
            <div key={s.num} className="col-md-6 col-lg-3">
              <div
                style={{
                  backgroundColor: '#12262d',
                  borderRadius: '14px',
                  padding: '26px 22px',
                  height: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(92, 184, 168, 0.2)',
                    color: '#5cb8a8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '16px'
                  }}
                >
                  <i className={`bi ${s.icon}`}></i>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#5cb8a8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  ETAPA 0{s.num}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px', lineHeight: 1.35 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Módulos Principais */}
        <div className="mb-5">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#fff' }}>Recursos Integrados da Solução</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Tudo que profissionais e clínicas necessitam em um único ambiente unificado.</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div style={{ backgroundColor: '#12262d', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '24px', color: '#5cb8a8', marginBottom: '12px' }}><i className="bi bi-shield-lock-fill"></i></div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Conformidade Ética & LGPD</h4>
                <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 }}>Armazenamento criptografado e logs de auditoria para cada ação sensível realizada na base de dados.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div style={{ backgroundColor: '#12262d', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '24px', color: '#5cb8a8', marginBottom: '12px' }}><i className="bi bi-camera-video-fill"></i></div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Telepsicologia Integrada</h4>
                <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 }}>Chamadas de vídeo estáveis, com enquadre terapêutico seguro e sem necessidade de downloads complicados.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div style={{ backgroundColor: '#12262d', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '24px', color: '#5cb8a8', marginBottom: '12px' }}><i className="bi bi-cash-stack"></i></div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Faturamento & Recibos</h4>
                <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 }}>Emissão ágil de recibos, controle de recebimentos pendentes e gráficos detalhados de receita.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção FAQ */}
        <div className="mb-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '24px', color: '#fff' }}>
            Perguntas Frequentes
          </h2>
          <div className="d-flex flex-column gap-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#12262d',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '14.5px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <i className={`bi bi-chevron-${openFaq === idx ? 'up' : 'down'} text-muted`}></i>
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 20px 18px', color: 'rgba(255,255,255,0.7)', fontSize: '13.5px', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Rodapé */}
        <div style={{ backgroundColor: '#12262d', borderRadius: '16px', padding: '36px', border: '1px solid rgba(92, 184, 168, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              Pronto para modernizar sua gestão psicológica?
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '14px', margin: 0, maxWidth: '600px' }}>
              Experimente a plataforma completa com dados fictícios para demonstração e conheça todos os fluxos.
            </p>
          </div>
          <Link to="/login" style={{ background: '#5cb8a8', color: '#12343c', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            Acessar Demonstração
          </Link>
        </div>
      </main>
    </div>
  );
};
