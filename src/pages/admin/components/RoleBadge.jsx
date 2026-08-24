import React from 'react';

export const RoleBadge = ({ role }) => {
  const r = (role || 'FACULTY').toUpperCase();

  let label = 'Faculty';
  let color = 'var(--role-faculty)';
  let bg = 'var(--role-faculty-bg)';
  let border = 'var(--role-faculty-border)';

  if (r === 'DIRECTOR') {
    label = 'Director';
    color = 'var(--role-director)';
    bg = 'var(--role-director-bg)';
    border = 'var(--role-director-border)';
  } else if (r === 'HOD') {
    label = 'Head of Department (HOD)';
    color = 'var(--role-hod)';
    bg = 'var(--role-hod-bg)';
    border = 'var(--role-hod-border)';
  } else if (r === 'PROGRAMME_COORDINATOR') {
    label = 'Programme Coordinator';
    color = 'var(--role-pc)';
    bg = 'var(--role-pc-bg)';
    border = 'var(--role-pc-border)';
  } else if (r === 'ADMIN') {
    label = 'Administrator';
    color = 'var(--primary)';
    bg = 'var(--primary-subtle)';
    border = '#bfdbfe';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '11.5px',
        fontWeight: '700',
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};
