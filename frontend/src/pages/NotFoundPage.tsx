import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '480px' }}>
        <div style={{ fontSize: '72px', color: 'var(--primary)', fontWeight: 800, lineHeight: 1 }}>404</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '16px 0 8px' }}>
          Página não encontrada
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          O endereço solicitado não existe ou foi movido para outro local no sistema PsicoManager.
        </p>
        <Link to="/dashboard" className="btn-accent">
          <i className="bi bi-house-door me-1"></i> Ir para o Dashboard
        </Link>
      </div>
    </div>
  );
};
