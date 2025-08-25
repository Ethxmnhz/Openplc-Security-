
import React, { useRef, useEffect } from 'react';
import { useLogs } from './LogContext';
import './LogFeed.css';


const logTypeLabels = {
  bruteforce: 'Brute Force',
  undervoltage: 'Undervoltage',
  login: 'Login',
};

export default function LogFeed({ filter }) {
  const { logs } = useLogs();
  const logEndRef = useRef(null);

  let filteredLogs = logs;
  if (filter && filter !== 'all') {
    filteredLogs = logs.filter(l => l.type === filter);
  }


  // Auto-scroll only the log list, not the whole dashboard
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs]);

  return (
    <div className="log-feed">
      <div className="log-feed-header">Live Log Feed</div>
      <div className="log-feed-list">
        {filteredLogs.map((log, idx) => (
          <div
            key={idx}
            className={`log-feed-line ${log.type}`}
            style={{
              borderLeft: log.type === 'bruteforce' ? '6px solid #ff5252' : log.type === 'undervoltage' ? '6px solid #ffb300' : '6px solid #1976d2',
              color: log.type === 'bruteforce' ? '#ff5252' : log.type === 'undervoltage' ? '#ffb300' : '#1976d2',
              fontWeight: log.type === 'bruteforce' || log.type === 'undervoltage' ? 700 : 500,
            }}
          >
            <span className="log-feed-label">{logTypeLabels[log.type]}</span>
            {log.type === 'bruteforce' && log.ip && (
              <span className="log-feed-ip"> | IP: {log.ip}</span>
            )}
            <span className="log-feed-text">{log.text}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
