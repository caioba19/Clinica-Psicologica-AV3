import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'bi-inbox',
  title,
  description,
  actionText,
  onAction,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-5 px-4 ${className}`} style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(92, 184, 168, 0.12)',
          color: 'var(--accent, #5cb8a8)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginBottom: '16px'
        }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {title}
      </h4>
      {description && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px' }}>
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          type="button"
          className="btn-accent"
          style={{ padding: '7px 18px', fontSize: '12.5px' }}
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
      {action && !actionText && (
        <div className="mt-3">{action}</div>
      )}
    </div>
  );
};
