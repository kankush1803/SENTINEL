export default function AlertFeed({ alerts, onSelect, onAcknowledge, onEscalate, onResolve, getEventIcon }) {
  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');
  const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED');

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  }

  function timeSince(ts) {
    const seconds = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }

  return (
    <div className="alert-panel">
      <div className="alert-panel-header">
        <div className="alert-panel-title">
          🔔 Alert Feed
          {activeAlerts.length > 0 && (
            <span className="alert-count-badge">{activeAlerts.length}</span>
          )}
        </div>
      </div>

      <div className="alert-list">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛡️</div>
            <h3>All Clear</h3>
            <p>No active alerts. The system is monitoring all zones in real-time.</p>
          </div>
        ) : (
          <>
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`alert-item severity-${alert.severity}`}
                onClick={() => onSelect(alert)}
              >
                <div className="alert-item-header">
                  <span className="alert-type">
                    {getEventIcon(alert.eventType)} {alert.eventType.replace(/_/g, ' ')}
                  </span>
                  <span className={`severity-tag ${alert.severity}`}>{alert.severity}</span>
                </div>
                <div className="alert-location">
                  📍 {alert.location?.zone} — Floor {alert.location?.floor}
                </div>
                {alert.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    {alert.description}
                  </div>
                )}
                <div className="alert-time">
                  {formatTime(alert.timestamp)} · {timeSince(alert.timestamp)}
                </div>
                <div className="alert-status-row">
                  <span className={`alert-status-badge ${alert.status}`}>{alert.status}</span>
                  <div className="alert-actions">
                    {alert.status === 'UNACKNOWLEDGED' && (
                      <button className="btn btn-ack" onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}>ACK</button>
                    )}
                    {alert.status !== 'RESOLVED' && alert.status !== 'ESCALATED' && (
                      <button className="btn btn-escalate" onClick={(e) => { e.stopPropagation(); onEscalate(alert.id); }}>ESC</button>
                    )}
                    {alert.status !== 'RESOLVED' && (
                      <button className="btn btn-resolve" onClick={(e) => { e.stopPropagation(); onResolve(alert.id); }}>CLEAR</button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {resolvedAlerts.length > 0 && (
              <>
                <div style={{ padding: '12px 8px 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Resolved ({resolvedAlerts.length})
                </div>
                {resolvedAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="alert-item severity-LOW"
                    style={{ opacity: 0.5 }}
                    onClick={() => onSelect(alert)}
                  >
                    <div className="alert-item-header">
                      <span className="alert-type" style={{ color: 'var(--text-muted)' }}>
                        {getEventIcon(alert.eventType)} {alert.eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="severity-tag LOW">RESOLVED</span>
                    </div>
                    <div className="alert-time">{formatTime(alert.timestamp)}</div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
