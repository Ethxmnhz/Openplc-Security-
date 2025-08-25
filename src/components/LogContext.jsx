import React, { createContext, useContext, useState, useEffect } from 'react';

const LOG_STREAM_URL = 'http://10.196.42.113:5000/stream';

function classifyLog(log) {
  let type = 'other', ip = null;
  if (/brute force/i.test(log)) {
    type = 'bruteforce';
    const match = log.match(/SRC=([\d.]+)/);
    if (match) ip = match[1];
  } else if (/undervoltage/i.test(log)) {
    type = 'undervoltage';
  } else if (/GET \/runtime_logs/i.test(log)) {
    type = 'login';
  }
  return { text: log, type, ip };
}


const LogContext = createContext();

export function LogProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const [loginDetected, setLoginDetected] = useState(false);

  useEffect(() => {
    const evtSource = new window.EventSource(LOG_STREAM_URL);
    evtSource.onmessage = (e) => {
      const logObj = classifyLog(e.data);
      setLogs((prev) => [...prev, logObj]);
      if (logObj.type === 'login') setLoginDetected(true);
      if (/GET \/logout/.test(e.data) && /302 -/.test(e.data)) setLoginDetected(false);
    };
    return () => evtSource.close();
  }, []);

  const flushAll = () => {
    setLogs([]);
    setLoginDetected(false);
  };

  return (
    <LogContext.Provider value={{ logs, loginDetected, flushAll }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogContext);
}
