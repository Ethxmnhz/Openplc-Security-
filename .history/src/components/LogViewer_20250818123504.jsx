import React, { useEffect, useRef, useState } from 'react';
import './LogViewer.css';

const LOG_STREAM_URL = 'http://10.237.75.113:5000/stream'; // Update if backend IP changes

export default function LogViewer() {
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    const evtSource = new window.EventSource(LOG_STREAM_URL);
    evtSource.onmessage = (e) => {
      setLogs((prev) => [...prev, e.data]);
    };
    return () => evtSource.close();
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="log-viewer">
      <div className="log-list">
        {logs.map((log, idx) => (
          <div key={idx} className="log-line">{log}</div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
