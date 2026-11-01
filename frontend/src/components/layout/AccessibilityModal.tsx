import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTheme } from '../../context/ThemeContext';

export const AccessibilityModal: React.FC = () => {
  const {
    fontSizeLevel,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    highContrast,
    toggleHighContrast,
    openA11yModal,
    setOpenA11yModal
  } = useAccessibility();

  const { theme, toggleTheme } = useTheme();

  if (!openA11yModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1090,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={() => setOpenA11yModal(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-title"
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card, #ffffff)',
          color: 'var(--text-primary, #17262b)',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          border: '1px solid var(--border, #e2e8f0)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-universal-access-circle fs-4 text-primary"></i>
            <h3 id="a11y-title" style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
              Recursos de Acessibilidade
            </h3>
          </div>
          <button
            type="button"
            className="action-btn"
            onClick={() => setOpenA11yModal(false)}
            aria-label="Fechar modal de acessibilidade"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', marginBottom: '20px' }}>
          Ajuste as preferências de visualização, tamanho de texto e contraste para uma navegação confortável conforme as diretrizes WCAG 2.1.
        </p>

        {/* Ajuste do Tamanho da Fonte */}
        <div className="p-3 mb-3 rounded-3" style={{ backgroundColor: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border, #e2e8f0)' }}>
          <label className="d-block fw-bold mb-2" style={{ fontSize: '13px' }}>
            <i className="bi bi-fonts me-1"></i> Tamanho do Texto (Escala Tipográfica)
          </label>
          <div className="d-flex align-items-center justify-content-between gap-2">
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Atual: <strong>{fontSizeLevel === 'normal' ? 'Padrão (100%)' : fontSizeLevel === 'large' ? 'Médio (115%)' : 'Grande (130%)'}</strong>
            </span>
            <div className="btn-group" role="group" aria-label="Controle de tamanho de fonte">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={decreaseFontSize}
                disabled={fontSizeLevel === 'normal'}
                title="Diminuir texto"
                aria-label="Diminuir texto"
              >
                A-
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={resetFontSize}
                title="Restaurar tamanho padrão"
                aria-label="Restaurar tamanho padrão"
              >
                Padrão
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={increaseFontSize}
                disabled={fontSizeLevel === 'xlarge'}
                title="Aumentar texto"
                aria-label="Aumentar texto"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Modo de Alto Contraste */}
        <div className="p-3 mb-3 rounded-3 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border, #e2e8f0)' }}>
          <div>
            <strong className="d-block" style={{ fontSize: '13.5px' }}>
              <i className="bi bi-circle-half me-1"></i> Modo de Alto Contraste
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Aumenta o contraste visual para facilitar a leitura.
            </span>
          </div>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="highContrastSwitch"
              checked={highContrast}
              onChange={toggleHighContrast}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Tema Escuro / Claro */}
        <div className="p-3 mb-4 rounded-3 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--bg-main, #f8fafc)', border: '1px solid var(--border, #e2e8f0)' }}>
          <div>
            <strong className="d-block" style={{ fontSize: '13.5px' }}>
              <i className="bi bi-moon-stars me-1"></i> Modo Escuro (Dark Mode)
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Reduz o cansaço visual em ambientes de pouca luz.
            </span>
          </div>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="themeSwitch"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary w-100"
          style={{ background: '#2c5f6e', borderColor: '#2c5f6e', fontWeight: 700 }}
          onClick={() => setOpenA11yModal(false)}
        >
          Aplicar e Fechar
        </button>
      </div>
    </div>
  );
};
