import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [matchOpen, setMatchOpen] = useState(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#173f4b',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Institucional */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: '#173f4b',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: '#FFFFFF'
            }}
          >
            <img
              src="/logo-icon.png"
              alt="PsicoManager Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(92, 184, 168, 0.25)',
                flexShrink: 0
              }}
            />
            <span style={{ fontSize: '21px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Psico<span style={{ color: '#5cb8a8' }}>Manager</span>
            </span>
          </Link>

          {/* Links da Navbar */}
          <nav className="d-none d-md-flex align-items-center gap-4" style={{ fontSize: '14px', fontWeight: 500 }}>
            <Link to="/como-funciona" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
              Como funciona
            </Link>
            <Link to="/para-psicologos" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
              Para psicólogos
            </Link>
            <Link to="/para-empresas" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
              Para empresas
            </Link>
            <Link to="/blog" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
              Blog
            </Link>
          </nav>
        </div>

        {/* Botões do Topo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            className="d-none d-sm-inline-flex"
            onClick={() => navigate('/como-funciona')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Ativar benefício
          </button>
          <Link
            to="/login"
            style={{
              backgroundColor: '#5cb8a8',
              color: '#12343c',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 24px',
              fontSize: '13.5px',
              fontWeight: 700,
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(92, 184, 168, 0.3)'
            }}
          >
            Entrar
          </Link>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <i className="bi bi-globe"></i>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 48px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          position: 'relative'
        }}
        className="flex-column flex-lg-row gap-5"
      >
        {/* Texto Hero */}
        <div style={{ flex: 1, maxWidth: '580px' }}>
          <span
            style={{
              display: 'inline-block',
              color: '#5cb8a8',
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '14px'
            }}
          >
            TERAPIA ONLINE & PRESENCIAL
          </span>

          <h1
            style={{
              fontSize: '48px',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#FFFFFF',
              marginBottom: '28px',
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'
            }}
          >
            Seu psicólogo a qualquer hora, em qualquer lugar.
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.7,
              marginBottom: '36px'
            }}
          >
            Conectamos você aos melhores psicólogos com prontuário seguro, teleconsultas de alta definição e acompanhamento contínuo em conformidade com o CFP.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              style={{
                backgroundColor: '#12262d',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Escolher meu psicólogo</span>
              <i className="bi bi-arrow-right"></i>
            </Link>

            <Link
              to="/para-psicologos"
              style={{
                backgroundColor: 'rgba(92, 184, 168, 0.15)',
                color: '#b8e3dc',
                border: '1px solid rgba(92, 184, 168, 0.3)',
                borderRadius: '8px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Sou profissional</span>
            </Link>
          </div>
        </div>

        {/* Visual Hero / Foto com Orgânica Shape */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '440px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              height: '420px',
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
              background: 'linear-gradient(135deg, #2c5f6e 0%, #173f4b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Ilustração e Destaque de Acolhimento Clínico */}
            <div style={{ textAlign: 'center', padding: '24px 32px', maxWidth: '340px' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'rgba(92, 184, 168, 0.15)',
                  border: '2px solid rgba(92, 184, 168, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  color: '#5cb8a8',
                  boxShadow: '0 8px 24px rgba(92, 184, 168, 0.2)'
                }}
              >
                <i className="bi bi-heart-pulse-fill" style={{ fontSize: '38px' }}></i>
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#fff', margin: 0 }}>Atendimento Humanizado</h3>
              <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', marginTop: '6px', lineHeight: 1.4 }}>
                Profissionais credenciados com registro ativo no CFP
              </p>
            </div>
          </div>

          {/* Card Flutuante "Experimente o PsicoMatch" (Posicionado offset na lateral inferior sem cobrir o texto) */}
          {matchOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '-12px',
                right: 'max(-20px, calc(50% - 240px))',
                backgroundColor: '#0f2026',
                borderRadius: '14px',
                padding: '16px 20px',
                maxWidth: '270px',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(92, 184, 168, 0.25)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div className="d-flex align-items-center gap-2">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5cb8a8' }}></span>
                  <strong style={{ fontSize: '13px', color: '#FFFFFF' }}>PsicoMatch Inteligente</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setMatchOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}
                  title="Fechar"
                >
                  <i className="bi bi-x fs-6"></i>
                </button>
              </div>
              <p style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, margin: '6px 0 10px' }}>
                Encontre o psicólogo ideal para sua necessidade em menos de 2 minutos.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'rgba(92, 184, 168, 0.15)',
                  border: '1px solid rgba(92, 184, 168, 0.3)',
                  color: '#5cb8a8',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Iniciar Match</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
