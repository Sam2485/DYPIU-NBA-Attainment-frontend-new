import React, { useState, useEffect } from 'react';
import { Menu, Activity } from 'lucide-react';
import { healthApi } from '../../api/health';
import { Badge } from '../common/Badge';

export const Header = ({ onToggleMobile }) => {
  const [healthStatus, setHealthStatus] = useState('UP');

  useEffect(() => {
    let isMounted = true;
    healthApi.getHealth()
      .then((res) => {
        if (isMounted) {
          const st = res?.data?.status || res?.status || 'UP';
          setHealthStatus(st);
        }
      })
      .catch(() => {
        if (isMounted) setHealthStatus('DEGRADED');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header
      style={{
        height: '56px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleMobile}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: 'var(--text-secondary)',
          }}
          className="mobile-menu-trigger"
        >
          <Menu size={20} />
        </button>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
          Institutional Administration
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System Health Indicator Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} color={healthStatus === 'UP' ? 'var(--success)' : 'var(--warning)'} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
            System:
          </span>
          <Badge variant={healthStatus === 'UP' ? 'success' : 'warning'} size="sm">
            {healthStatus === 'UP' ? 'Healthy' : 'Degraded'}
          </Badge>
        </div>
      </div>
    </header>
  );
};
