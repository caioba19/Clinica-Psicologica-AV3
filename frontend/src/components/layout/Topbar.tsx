import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAccessibility } from '../../context/AccessibilityContext';

const NOTIFICATIONS = [
  { id: 1, icon: 'calendar-check', text: 'Consulta confirmada: Kauan Marinho às 14h', time: 'Hoje', read: false },
  { id: 2, icon: 'clock-history', text: 'Lembrete: sessão com Lucas Mendes amanhã às 10h30', time: 'Hoje', read: false },
  { id: 3, icon: 'check-circle', text: 'Prontuário de Ana Silva atualizado com sucesso', time: 'Ontem', read: true },
];

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const goToAgenda = () => { setOpen(false); navigate('/agenda'); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="topbar-btn"
        type="button"
        aria-label="Notificações"
        title="Notificações"
        onClick={() => setOpen((o) => !o)}
      >
        <i className="bi bi-bell"></i>
        {unread > 0 && (
          <span
            style={{
              position: 'absolute', top: 2, right: 2, background: '#e53e3e', color: '#fff',
              borderRadius: '50%', fontSize: 10, minWidth: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px', pointerEvents: 'none'
            }}
          >
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: '110%', width: 320,
            background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 9999, overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '12px 16px', borderBottom: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-card, #ffffff)'
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-main, #1a202c)' }}>Notificações</span>
            {unread > 0 && (
              <span
                role="button"
                onClick={markAllRead}
                style={{ fontSize: 11, color: '#2b6cb0', cursor: 'pointer' }}
              >
                Marcar todas como lidas
              </span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted, #718096)', fontSize: 13 }}>
              <i className="bi bi-bell-slash" style={{ fontSize: 24, display: 'block', marginBottom: 8 }}></i>
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
                  borderBottom: '1px solid var(--border-color, #f0f0f0)',
                  background: n.read ? 'var(--bg-card, #ffffff)' : '#f0f7ff'
                }}
              >
                <i className={`bi bi-${n.icon}`} style={{ color: '#2b6cb0', fontSize: 18, marginTop: 2 }}></i>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: 'var(--text-main, #1a202c)' }}>{n.text}</p>
                  <span style={{ fontSize: 11, color: 'var(--text-muted, #718096)' }}>{n.time}</span>
                </div>
                {!n.read && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e53e3e', flexShrink: 0, marginTop: 5 }}></span>
                )}
              </div>
            ))
          )}
          <div style={{ padding: '10px 16px', textAlign: 'center', background: 'var(--bg-card, #ffffff)' }}>
            <span
              role="button"
              onClick={goToAgenda}
              style={{ fontSize: 12, color: '#2b6cb0', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Ver agenda completa
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

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

        <NotificationBell />

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
