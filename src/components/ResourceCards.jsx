import React from 'react';
import './ResourceCards.css';

const resources = [
  { label: 'CPU Usage', value: '23%', icon: '🖥️', color: '#1976d2', bg: 'linear-gradient(135deg, #e3f0ff 60%, #fff 100%)' },
  { label: 'RAM Usage', value: '1.2 GB / 4 GB', icon: '💾', color: '#43a047', bg: 'linear-gradient(135deg, #e8f5e9 60%, #fff 100%)' },
  { label: 'Disk Usage', value: '12 GB / 32 GB', icon: '💽', color: '#ffb300', bg: 'linear-gradient(135deg, #fff8e1 60%, #fff 100%)' },
];

export default function ResourceCards() {
  return (
    <div className="resource-cards">
      {resources.map((r, i) => (
        <div key={i} className="resource-card" style={{background: r.bg, color: r.color}}>
          <span className="resource-icon">{r.icon}</span>
          <span className="resource-label">{r.label}</span>
          <span className="resource-value">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
