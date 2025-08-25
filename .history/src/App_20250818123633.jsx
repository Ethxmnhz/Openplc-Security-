import LogViewer from './components/LogViewer';
import './App.css';

function App() {
  return (
    <div className="dashboard-root">
      <nav className="navbar">
        <span className="navbar-title">SIEM Dashboard</span>
      </nav>
      <div className="dashboard-body">
        <aside className="sidebar">
          <ul>
            <li className="active">Logs</li>
            <li>Settings</li>
            <li>About</li>
          </ul>
        </aside>
        <main className="main-content">
          <LogViewer />
        </main>
      </div>
    </div>
  );
}

export default App;
