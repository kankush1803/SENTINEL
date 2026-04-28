const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] }
});

app.use(cors());
app.use(express.json());

// ─── In-Memory Alert Store ─────────────────────────────────────────────────────
let alerts = [];
let alertIdCounter = 1;

// ─── Stats ──────────────────────────────────────────────────────────────────────
function getStats() {
  const total = alerts.length;
  const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
  const active = alerts.filter(a => a.status !== 'RESOLVED').length;
  const resolved = alerts.filter(a => a.status === 'RESOLVED').length;
  return { total, critical, active, resolved };
}

// ─── REST API ───────────────────────────────────────────────────────────────────

// GET all alerts
app.get('/api/alerts', (req, res) => {
  res.json({ alerts, stats: getStats() });
});

// POST new alert (from sensors / simulator)
app.post('/api/alerts', (req, res) => {
  const { eventType, severity, zone, floor, source, description } = req.body;

  const alert = {
    id: `EVT-${Date.now()}-${alertIdCounter++}`,
    timestamp: new Date().toISOString(),
    eventType: eventType || 'UNKNOWN',
    severity: severity || 'MEDIUM',
    location: {
      zone: zone || 'Unknown Zone',
      floor: floor || '1',
    },
    source: source || 'MANUAL',
    description: description || '',
    status: 'UNACKNOWLEDGED',
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedAt: null,
  };

  alerts.unshift(alert);

  // Broadcast to all connected dashboards
  io.emit('new-alert', alert);
  io.emit('stats-update', getStats());

  console.log(`🚨 NEW ALERT: [${alert.severity}] ${alert.eventType} in ${alert.location.zone}`);
  res.status(201).json(alert);
});

// PUT update alert status (acknowledge / resolve)
app.put('/api/alerts/:id', (req, res) => {
  const { id } = req.params;
  const { status, acknowledgedBy } = req.body;

  const alert = alerts.find(a => a.id === id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  if (status === 'ACKNOWLEDGED') {
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = acknowledgedBy || 'Security Staff';
    alert.acknowledgedAt = new Date().toISOString();
  } else if (status === 'RESOLVED') {
    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();
  } else if (status === 'ESCALATED') {
    alert.status = 'ESCALATED';
    alert.severity = 'CRITICAL';
  }

  io.emit('alert-updated', alert);
  io.emit('stats-update', getStats());

  console.log(`✅ ALERT UPDATED: [${alert.id}] → ${alert.status}`);
  res.json(alert);
});

// DELETE clear all resolved
app.delete('/api/alerts/resolved', (req, res) => {
  alerts = alerts.filter(a => a.status !== 'RESOLVED');
  io.emit('alerts-refresh', alerts);
  io.emit('stats-update', getStats());
  res.json({ message: 'Resolved alerts cleared' });
});

// ─── WebSocket ──────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`📡 Dashboard connected: ${socket.id}`);
  socket.emit('alerts-refresh', alerts);
  socket.emit('stats-update', getStats());

  socket.on('disconnect', () => {
    console.log(`📴 Dashboard disconnected: ${socket.id}`);
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────────
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`\n🛡️  SENTINEL Backend running on http://localhost:${PORT}`);
  console.log(`   POST /api/alerts    → Create alert`);
  console.log(`   GET  /api/alerts    → List alerts`);
  console.log(`   PUT  /api/alerts/:id → Update alert\n`);
});
