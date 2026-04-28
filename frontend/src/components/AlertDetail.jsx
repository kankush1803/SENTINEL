export default function AlertDetail({ alert, onClose, onAcknowledge, onEscalate, onResolve, getEventIcon }) {
  if (!alert) return null;

  function formatTime(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-US', {
      hour12: false,
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span>{getEventIcon(alert.eventType)}</span>
            {alert.eventType.replace(/_/g, ' ')}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-field">
              <label>Event ID</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{alert.id}</span>
            </div>
            <div className="detail-field">
              <label>Severity</label>
              <span className={`severity-tag ${alert.severity}`} style={{ fontSize: 12 }}>{alert.severity}</span>
            </div>
            <div className="detail-field">
              <label>Zone</label>
              <span>📍 {alert.location?.zone}</span>
            </div>
            <div className="detail-field">
              <label>Floor</label>
              <span>{alert.location?.floor}</span>
            </div>
            <div className="detail-field">
              <label>Source</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{alert.source}</span>
            </div>
            <div className="detail-field">
              <label>Status</label>
              <span className={`alert-status-badge ${alert.status}`}>{alert.status}</span>
            </div>
            <div className="detail-field">
              <label>Detected At</label>
              <span style={{ fontSize: 12 }}>{formatTime(alert.timestamp)}</span>
            </div>
            <div className="detail-field">
              <label>Acknowledged At</label>
              <span style={{ fontSize: 12 }}>{formatTime(alert.acknowledgedAt)}</span>
            </div>
          </div>

          {alert.description && (
            <div className="detail-field" style={{ marginBottom: 20 }}>
              <label>Description</label>
              <span>{alert.description}</span>
            </div>
          )}

          {alert.acknowledgedBy && (
            <div className="detail-field" style={{ marginBottom: 20 }}>
              <label>Acknowledged By</label>
              <span>👤 {alert.acknowledgedBy}</span>
            </div>
          )}

          {alert.status !== 'RESOLVED' && (
            <div className="modal-actions">
              {alert.status === 'UNACKNOWLEDGED' && (
                <button className="btn btn-ack" onClick={() => onAcknowledge(alert.id)}>
                  ✓ Acknowledge
                </button>
              )}
              {alert.status !== 'ESCALATED' && (
                <button className="btn btn-escalate" onClick={() => onEscalate(alert.id)}>
                  ⬆ Escalate
                </button>
              )}
              <button className="btn btn-resolve" onClick={() => onResolve(alert.id)}>
                ✓ Resolve & Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
