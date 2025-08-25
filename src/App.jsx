

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import EventStatusCards from './components/EventStatusCards';
import LogFeed from './components/LogFeed';
import { LogProvider, useLogs } from './components/LogContext';
import './App.css';


function DashboardContent({ filter, setFilter }) {
  const { flushAll } = useLogs();
  return (
    <div className="dashboard-root">
      <Sidebar filter={filter} setFilter={setFilter} />
      <div className="main-area">
        <Navbar />
        <div className="main-content-area">
          <button style={{marginBottom: '1rem', alignSelf: 'flex-end'}} onClick={flushAll}>Flush Logs</button>
          <EventStatusCards />
          <LogFeed filter={filter} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [filter, setFilter] = useState('all');
  return (
    <LogProvider>
      <DashboardContent filter={filter} setFilter={setFilter} />
    </LogProvider>
  );
}

export default App;
