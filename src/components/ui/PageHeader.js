import React from 'react';

const RED = '#E23E3E';

export default function PageHeader({ title = '', description = '', action = null }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 28, paddingBottom: 20,
      borderBottom: '1px solid #E5E7EB',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: description ? 4 : 0 }}>
          <span style={{ width: 3, height: 22, borderRadius: 2, background: RED, display: 'inline-block', flexShrink: 0 }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>{title}</h1>
        </div>
        {description && (
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 0 13px' }}>{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
