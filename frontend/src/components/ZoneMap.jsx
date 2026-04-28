const ZONES = [
  { id: 'lobby', name: 'Main Lobby', icon: '🏨', floor: 'Ground Floor' },
  { id: 'tower-a', name: 'Tower A', icon: '🏢', floor: 'Floors 1-15' },
  { id: 'tower-b', name: 'Tower B', icon: '🏢', floor: 'Floors 1-15' },
  { id: 'pool', name: 'Pool & Spa', icon: '🏊', floor: 'Ground Floor' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️', floor: 'Ground Floor' },
  { id: 'kitchen', name: 'Kitchen', icon: '👨‍🍳', floor: 'Ground Floor' },
  { id: 'parking', name: 'Parking Garage', icon: '🅿️', floor: 'Basement' },
  { id: 'ballroom', name: 'Ballroom', icon: '🎭', floor: 'Floor 2' },
  { id: 'gym', name: 'Fitness Center', icon: '🏋️', floor: 'Floor 1' },
];

export default function ZoneMap({ zoneAlerts }) {
  return (
    <div className="zone-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <span>🗺️</span> Property Zone Map
        </h2>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {ZONES.length} zones monitored
        </span>
      </div>

      <div className="zone-grid">
        {ZONES.map(zone => {
          const alertData = zoneAlerts[zone.name];
          const isActive = alertData && alertData.count > 0;

          return (
            <div
              key={zone.id}
              className={`zone-card ${isActive ? 'alert-active' : ''}`}
            >
              {isActive && (
                <div className="zone-alert-count">{alertData.count}</div>
              )}
              <div className="zone-icon">{zone.icon}</div>
              <div className="zone-name">{zone.name}</div>
              <div className="zone-floor">{zone.floor}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
