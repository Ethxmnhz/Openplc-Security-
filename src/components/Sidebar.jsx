import React from 'react';
import './Sidebar.css';

const navItems = [
  { key: 'all', label: 'Dashboard', icon: '🏠' },
  { key: 'bruteforce', label: 'Brute Force', icon: '🛡️' },
  { key: 'undervoltage', label: 'Undervoltage', icon: '⚡' },
  { key: 'login', label: 'Login', icon: '🔑' },
];

export default function Sidebar({ filter, setFilter }) {
  return (
    <aside className="sidebar-modern">
      <div className="sidebar-logo">SIEM</div>
      <ul className="sidebar-nav">
        {navItems.map(item => (
          <li
            key={item.key}
            className={filter === item.key ? 'active' : ''}
            onClick={() => setFilter(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
