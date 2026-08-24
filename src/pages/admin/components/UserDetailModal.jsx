import React from 'react';
import { X, Mail, Building, GraduationCap, Edit } from 'lucide-react';
import { RoleBadge } from './RoleBadge';

export const UserDetailModal = ({ isOpen, onClose, user, onEdit }) => {
  if (!isOpen || !user) return null;

  const initials = (user.name || user.username || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '800',
              }}
            >
              {initials}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {user.name || user.username}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{user.username || 'user'}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Academic Role
            </div>
            <RoleBadge role={user.role} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)' }}>
            <Mail size={18} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Email Address</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)' }}>
            <Building size={18} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Assigned Department</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user.department || user.departmentId || 'Institutional / Not Assigned'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)' }}>
            <GraduationCap size={18} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Assigned Programme</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user.programme || user.programmeId || 'None / Not Assigned'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            onClick={() => {
              onClose();
              if (onEdit) onEdit(user);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Edit size={14} />
            <span>Edit Member</span>
          </button>
        </div>
      </div>
    </div>
  );
};
