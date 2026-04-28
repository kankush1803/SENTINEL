import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import ZoneMap from './components/ZoneMap';
import AlertFeed from './components/AlertFeed';
import AlertDetail from './components/AlertDetail';

const BACKEND_URL = 'http://localhost:3001';

const EVENT_ICONS = {
  FIRE: '🔥', MEDICAL: '🏥', ACTIVE_SHOOTER: '🔫', GAS_LEAK: '☣️',
  FLOOD: '🌊', INTRUDER: '🚨', CROWD_CRUSH: '👥', EARTHQUAKE: '🌍',
  POWER_OUTAGE: '⚡', UNKNOWN: '⚠️',
};

function getEventIcon(type) {
  return EVENT_ICONS[type] || '⚠️';
}

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, active: 0, resolved: 0 });
  const [connected, setConnected] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [clock, setClock] = useState('');
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Socket.io connection
  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('alerts-refresh', (data) => setAlerts(data));
    socket.on('stats-update', (data) => setStats(data));

    socket.on('new-alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      // Play alarm sound for critical
      if (alert.severity === 'CRITICAL' && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    });

    socket.on('alert-updated', (updated) => {
      setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
      setSelectedAlert(prev => prev?.id === updated.id ? updated : prev);
    });

    return () => socket.disconnect();
  }, []);

  // Actions
  const updateAlert = useCallback(async (id, status) => {
    try {
      await fetch(`${BACKEND_URL}/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, acknowledgedBy: 'Dashboard Operator' }),
      });
    } catch (err) {
      console.error('Failed to update alert:', err);
    }
  }, []);

  const hasCritical = alerts.some(a => a.severity === 'CRITICAL' && a.status === 'UNACKNOWLEDGED');

  // Build zone alert counts
  const zoneAlerts = {};
  alerts.forEach(a => {
    if (a.status !== 'RESOLVED') {
      const zone = a.location?.zone || 'Unknown';
      if (!zoneAlerts[zone]) zoneAlerts[zone] = { count: 0, hasCritical: false, types: [] };
      zoneAlerts[zone].count++;
      if (a.severity === 'CRITICAL') zoneAlerts[zone].hasCritical = true;
      zoneAlerts[zone].types.push(a.eventType);
    }
  });

  return (
    <div className="app-layout">
      {/* Alarm overlay for critical unacknowledged alerts */}
      {hasCritical && <div className="alarm-overlay" />}

      {/* Hidden audio element for alarm */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=" type="audio/wav" />
      </audio>

      {/* ── Top Bar ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">S</div>
          <div>
            <div className="topbar-title">SENTINEL</div>
            <div className="topbar-subtitle">Crisis Response Command Center</div>
          </div>
        </div>
        <div className="topbar-status">
          <div className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
            <span className="connection-dot" />
            {connected ? 'Live' : 'Offline'}
          </div>
          <div className="clock">{clock}</div>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-icon critical">🚨</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--status-critical)' }}>{stats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">⚡</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--status-high)' }}>{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon resolved">✅</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--status-low)' }}>{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="main-content">
        <ZoneMap zoneAlerts={zoneAlerts} />
        <AlertFeed
          alerts={alerts}
          onSelect={setSelectedAlert}
          onAcknowledge={(id) => updateAlert(id, 'ACKNOWLEDGED')}
          onEscalate={(id) => updateAlert(id, 'ESCALATED')}
          onResolve={(id) => updateAlert(id, 'RESOLVED')}
          getEventIcon={getEventIcon}
        />
      </div>

      {/* ── Alert Detail Modal ── */}
      {selectedAlert && (
        <AlertDetail
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={(id) => updateAlert(id, 'ACKNOWLEDGED')}
          onEscalate={(id) => updateAlert(id, 'ESCALATED')}
          onResolve={(id) => updateAlert(id, 'RESOLVED')}
          getEventIcon={getEventIcon}
        />
      )}
    </div>
  );
}
