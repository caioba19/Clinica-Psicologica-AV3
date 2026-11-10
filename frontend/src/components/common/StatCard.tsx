import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: string;
  color?: 'teal' | 'blue' | 'green' | 'orange' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'up',
  icon,
  color = 'teal'
}) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <i className={`bi ${icon.startsWith('bi-') ? icon : `bi-${icon}`}`}></i>
      </div>
      <div className="stat-info">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{title}</p>
        {change && (
          <span className={`stat-change ${changeType}`}>
            <i className={`bi bi-arrow-${changeType === 'up' ? 'up-short' : 'down-short'} me-1`}></i>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
