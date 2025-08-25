


import React from 'react';
import { useLogs } from './LogContext';
import './EventStatusCards.css';

export default function EventStatusCards() {
  const { logs, loginDetected } = useLogs();
  // Brute force and undervoltage as before
  const bruteForceCount = logs.filter(l => l.type === 'bruteforce').length;
  const undervoltageCount = logs.filter(l => l.type === 'undervoltage').length;

  const events = [
    { label: 'Brute Force', detected: bruteForceCount > 50, color: '#ff5252', icon: '🛡️' },
    { label: 'Undervoltage', detected: undervoltageCount > 0, color: '#ffb300', icon: '⚡' },
    { label: 'Login', detected: loginDetected, color: '#1976d2', icon: '🔑' },
  ];
  return (
    <div className="event-status-cards">
      {events.map((e, i) => (
        <div key={i} className="event-status-card" style={{background: e.detected ? e.color : '#fff', color: e.detected ? '#fff' : e.color}}>
          <span className="event-status-icon">{e.icon}</span>
          <span className="event-status-label">{e.label}</span>
          {e.detected && <span className="event-status-detected">Detected</span>}
        </div>
      ))}
    </div>
  );
}
