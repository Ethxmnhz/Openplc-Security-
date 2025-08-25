

import React, { useEffect, useRef, useState } from 'react';
import './LogViewer.css';

const LOG_STREAM_URL = 'http://10.196.42.113:5000/stream'; // Stream URL for logs

// Helper to classify log lines and extract info
function classifyLog(log) {
  let type = 'other', ip = null;
  if (/brute force/i.test(log)) {
    type = 'bruteforce';
    // Try to extract SRC IP
    const match = log.match(/SRC=([\d.]+)/);
    if (match) ip = match[1];
  } else if (/undervoltage/i.test(log)) {
    type = 'undervoltage';
  } else if (/voltage normalised/i.test(log)) {
    type = 'voltage';
  } else if (/GET \/login/i.test(log)) {
    type = 'login';
  }
  return { text: log, type, ip }; // Return log details
}

const logTypeLabels = {
  bruteforce: 'Brute Force',
  undervoltage: 'Undervoltage',
  login: 'Login',
};
const logTypeColors = {
  bruteforce: '#ff5252',
  undervoltage: '#ffb300',
  login: '#1976d2',
};


// System resource widget (placeholder values)
function SystemResourceCards() {
  // In a real app, fetch these from an API
  const resources = [
    { label: 'CPU Usage', value: '23%', color: '#1976d2', icon: '🖥️', bg: 'linear-gradient(135deg, #e3f0ff 60%, #fff 100%)' },
    { label: 'RAM Usage', value: '1.2 GB / 4 GB', color: '#43a047', icon: '💾', bg: 'linear-gradient(135deg, #e8f5e9 60%, #fff 100%)' },
    { label: 'Disk Usage', value: '12 GB / 32 GB', color: '#ffb300', icon: '💽', bg: 'linear-gradient(135deg, #fff8e1 60%, #fff 100%)' },
  ];
  return (
    <div style={{display:'flex',gap:'1.5rem',margin:'2rem 0 2.5rem 0',justifyContent:'flex-start'}}>
      {resources.map((r, i) => (
        <div key={i} style={{
          background: r.bg,
          color: r.color,
          borderRadius: 18,
          boxShadow: '0 4px 24px #1976d233, 0 2px 12px #0001',
          padding: '1.2rem 2.2rem',
          minWidth: 160,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontWeight: 700,
          fontSize: '1.1rem',
        }}>
          <span style={{fontSize:'2rem',marginBottom:8}}>{r.icon}</span>
          <span style={{fontWeight:600}}>{r.label}</span>
          <span style={{fontWeight:800,fontSize:'1.2rem',marginTop:4}}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}


export default function LogViewer({ filter }) {
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    const evtSource = new window.EventSource(LOG_STREAM_URL);
    evtSource.onmessage = (e) => {
      setLogs((prev) => [...prev, classifyLog(e.data)]);
    };
    return () => evtSource.close();
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Filter logs if filter is set
  let filteredLogs = logs;
  if (filter && filter !== 'all') {
    filteredLogs = logs.filter(l => l.type === filter);
  }

  // Find if any brute force or undervoltage is present for card highlight
  const hasBruteForce = logs.some(l => l.type === 'bruteforce');
  const hasUndervoltage = logs.some(l => l.type === 'undervoltage');

  return (
    <div className="log-viewer light-theme" style={{boxShadow: '0 8px 32px #1976d233, 0 1.5px 8px #0001', borderRadius: 24, background: 'linear-gradient(135deg, #f6f8fa 60%, #e3f0ff 100%)', padding: '2.5rem 2.5rem 2rem 2.5rem', maxWidth: 1200, margin: '0 auto'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2.5rem'}}>
        <h2 style={{margin:0, fontWeight:800, fontSize:'2.1rem', letterSpacing:'.5px', color:'#222'}}>System Overview</h2>
        <span style={{fontSize:'1.1rem', color:'#888'}}>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
      <SystemResourceCards />
      <div style={{margin:'2.5rem 0 1.5rem 0', display:'flex', alignItems:'center', gap:'1.5rem'}}>
        <h3 style={{margin:0, fontWeight:700, fontSize:'1.3rem', color:'#222'}}>Security & Power Events</h3>
        <span style={{fontSize:'1rem', color:'#bbb'}}>Live detection status</span>
      </div>
      <div className="log-summary-cards" style={{gap: '2.5rem', marginBottom: '2.5rem', justifyContent: 'flex-start'}}>
        <div className="log-summary-card bruteforce" style={{background: hasBruteForce ? '#ff5252' : 'linear-gradient(135deg, #fff 60%, #ffeaea 100%)', color: hasBruteForce ? '#fff' : '#ff5252', border: hasBruteForce ? '2.5px solid #ff5252' : 'none', fontWeight: 700, minWidth:220}}>
          <span className="log-summary-title">Brute Force</span>
          {hasBruteForce && <span style={{fontWeight:800, fontSize:'1.1rem'}}>Detected</span>}
        </div>
        <div className="log-summary-card undervoltage" style={{background: hasUndervoltage ? '#ffb300' : 'linear-gradient(135deg, #fff 60%, #fff8e1 100%)', color: hasUndervoltage ? '#fff' : '#ffb300', border: hasUndervoltage ? '2.5px solid #ffb300' : 'none', fontWeight: 700, minWidth:220}}>
          <span className="log-summary-title">Undervoltage</span>
          {hasUndervoltage && <span style={{fontWeight:800, fontSize:'1.1rem'}}>Detected</span>}
        </div>
        <div className="log-summary-card login" style={{background: 'linear-gradient(135deg, #fff 60%, #e3f2fd 100%)', color: '#1976d2', fontWeight: 700, minWidth:220}}>
          <span className="log-summary-title">Login</span>
        </div>
      </div>
      <div style={{margin:'2.5rem 0 1.5rem 0', display:'flex', alignItems:'center', gap:'1.5rem'}}>
        <h3 style={{margin:0, fontWeight:700, fontSize:'1.3rem', color:'#222'}}>Live Log Feed</h3>
        <span style={{fontSize:'1rem', color:'#bbb'}}>Most recent events</span>
      </div>
      <div className="log-list">
        {filteredLogs.map((log, idx) => (
          <div
            key={idx}
            className={`log-line-card ${log.type}`}
            style={{
              borderLeft: log.type === 'bruteforce' ? '8px solid #ff5252' : log.type === 'undervoltage' ? '8px solid #ffb300' : '8px solid #1976d2',
              background: log.type === 'bruteforce' ? 'linear-gradient(120deg, #fff 60%, #ffebee 100%)' : log.type === 'undervoltage' ? 'linear-gradient(120deg, #fff 60%, #fff8e1 100%)' : 'linear-gradient(120deg, #fff 60%, #e3f2fd 100%)',
              color: log.type === 'bruteforce' ? '#ff5252' : log.type === 'undervoltage' ? '#ffb300' : '#1976d2',
              fontWeight: log.type === 'bruteforce' || log.type === 'undervoltage' ? 700 : 500,
            }}
          >
            <span className="log-line-label">{logTypeLabels[log.type]}</span>
            {log.type === 'bruteforce' && log.ip && (
              <span className="log-line-ip"> | IP: {log.ip}</span>
            )}
            <div className="log-line-text">{log.text}</div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
