import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link to={item.href} style={{ color: 'var(--text-muted)', transition: 'color 0.15s ease' }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: isLast ? 'var(--text-primary)' : 'inherit', fontWeight: isLast ? '600' : 'normal' }}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight size={12} />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
