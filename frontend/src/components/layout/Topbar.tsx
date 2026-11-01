import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../context/AccessibilityContext';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenQuickModal: () => void;
  title?: string;
  subtitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  onOpenQuickModal,
  title = 'PsicoManager',
  subtitle
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { setOpenA11yModal } = useAccessibility();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <button
        className="topbar-toggle"
        type="button"
        aria-label="Abrir menu lateral"
        onClick={onToggleSidebar}
      >
        <i className="bi bi-list fs-5"></i>
      </button>

      <div className="topbar-breadcrumb">
        <span className="topbar-breadcrumb-title">{title}</span>
        {subtitle && (
          <>
            <span className="topbar-breadcrumb-sep">/</span>
            <span className="topbar-breadcrumb-sub">{subtitle}</span>
          </>
        )}
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Buscar paciente, prontuário..."
            aria-label="Buscar paciente ou prontuário"
          />
        </div>

        {/* Botão de Recursos de Acessibilidade (WCAG) */}
        <button
          className="topbar-btn"
          type="button"
          aria-label="Recursos de Acessibilidade (Fonte, Contraste)"
          title="Acessibilidade (Tamanho da Fonte, Alto Contraste)"
          onClick={() => setOpenA11yModal(true)}
        >
          <i className="bi bi-universal-access fs-5 text-primary"></i>
        </button>

        {/* Botão de Alternância de Tema Claro / Escuro */}
        <button
          className="topbar-btn"
          type="button"
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          title={theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
          onClick={toggleTheme}
        >
          <i className={`bi bi-${theme === 'dark' ? 'sun-fill text-warning' : 'moon-stars-fill'}`}></i>
        </button>

        <button
          className="topbar-btn"
          type="button"
          aria-label="Novo Agendamento Rápido"
          title="Novo Agendamento Rápido"
          onClick={onOpenQuickModal}
        >
          <i className="bi bi-plus-lg"></i>
        </button>

        <button
          className="topbar-btn"
          type="button"
          aria-label="Notificações"
          title="Notificações"
        >
          <i className="bi bi-bell"></i>
          <span className="topbar-btn-badge"></span>
        </button>

        <div className="topbar-divider"></div>

        <button
          type="button"
          className="topbar-avatar border-0 p-0 cursor-pointer"
          aria-label="Perfil"
          onClick={() => navigate('/perfil')}
          title="Acessar Perfil"
        >
          {user.avatarText || 'DS'}
        </button>
      </div>
    </header>
  );
};
