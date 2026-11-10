import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 38,
  className = '',
  showText = false,
  subtitle,
  light = false
}) => {
  return (
    <div className={`d-inline-flex align-items-center gap-2 ${className}`}>
      <img
        src="/logo-icon.png"
        alt="PsicoManager Logo"
        style={{
          width: size,
          height: size,
          borderRadius: `${Math.round(size * 0.28)}px`,
          objectFit: 'cover',
          boxShadow: '0 4px 12px rgba(23, 63, 75, 0.2)',
          flexShrink: 0
        }}
      />

      {showText && (
        <div className="d-flex flex-column text-start">
          <span
            style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontWeight: 700,
              fontSize: size > 40 ? '20px' : '17px',
              color: light ? '#ffffff' : 'var(--text-primary, #17262b)',
              lineHeight: 1.1
            }}
          >
            PsicoManager
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: '11px',
                color: light ? 'rgba(255,255,255,0.65)' : 'var(--text-muted, #8a989d)',
                marginTop: '2px',
                fontWeight: 500
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
