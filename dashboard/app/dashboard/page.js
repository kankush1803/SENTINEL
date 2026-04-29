"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Pusher from "pusher-js";
import { BACKEND_URL } from "../api";

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
});

const INITIAL_INCIDENTS = [
  {
    id: "#1047",
    type: "Medical Emergency",
    location: "Room 1204 · Floor 12",
    sev: "CRITICAL",
    status: "ACTIVE",
    eta: "2:47",
    assigned: "Dr. Ray + Nurse Kim",
    ts: "21:18:04",
    ai: "Cardiac Event — 94% confidence",
    color: "var(--red)",
  },
  {
    id: "#1046",
    type: "Suspicious Activity",
    location: "B2 Parking · Zone C",
    sev: "HIGH",
    status: "ACTIVE",
    eta: "4:12",
    assigned: "Security Alpha, Beta",
    ts: "21:14:31",
    ai: "Unauthorised Access Pattern — 81%",
    color: "var(--amber)",
  },
  {
    id: "#1045",
    type: "Fire Alarm",
    location: "Ballroom East · Floor 3",
    sev: "CRITICAL",
    status: "RESOLVED",
    eta: "—",
    assigned: "Fire Unit 2",
    ts: "20:58:00",
    ai: "Smoke Detected — 97% confidence",
    color: "var(--green)",
  },
  {
    id: "#1044",
    type: "Minor Injury",
    location: "Pool Area · Floor 1",
    sev: "LOW",
    status: "RESOLVED",
    eta: "—",
    assigned: "First Aid Team",
    ts: "20:41:17",
    ai: "Slip & Fall — 88% confidence",
    color: "var(--green)",
  },
];

const STAFF = [
  {
    name: "Raj Kumar",
    role: "Security",
    floor: "B2",
    status: "RESPONDING",
    incident: "#1046",
  },
  {
    name: "Priya Menon",
    role: "Nurse",
    floor: "12",
    status: "ENROUTE",
    incident: "#1047",
  },
  {
    name: "Tom Lee",
    role: "Concierge",
    floor: "3",
    status: "STANDBY",
    incident: null,
  },
  {
    name: "Sara Patel",
    role: "Fire Safety",
    floor: "3",
    status: "RESOLVED",
    incident: "#1045",
  },
  {
    name: "Ali Hassan",
    role: "Security",
    floor: "6",
    status: "STANDBY",
    incident: null,
  },
  {
    name: "Neha Singh",
    role: "Nurse",
    floor: "12",
    status: "ENROUTE",
    incident: "#1047",
  },
];

const SCENARIOS = [
  { id: 1, label: "🔥 Fire Alarm", type: "FIRE", location: "Ballroom East · Floor 3", source: "IoT Sensor SM-402", desc: "Smoke detected in electrical closet" },
  { id: 2, label: "💊 Medical SOS", type: "MEDICAL", location: "Pool Area · Floor 1", source: "Guest SOS", desc: "Guest unconscious near pool side" },
  { id: 3, label: "🛡️ Security Breach", type: "SECURITY", location: "B2 Parking · Zone C", source: "AI Camera Feed", desc: "Unauthorised access to restricted server room" },
  { id: 4, label: "📢 General SOS", type: "SOS", location: "Room 1204 · Floor 12", source: "Guest Mobile", desc: "Silent alarm triggered from guest room" },
];

const TIMELINE = [
  { t: "21:18:04", txt: "Guest SOS received — Room 1204", dot: "pulse-red" },
  {
    t: "21:18:06",
    txt: "AI classified: Medical Emergency (P1)",
    dot: "pulse-blue",
  },
  {
    t: "21:18:07",
    txt: "Staff Dr. Ray & Nurse Kim dispatched",
    dot: "pulse-amber",
  },
  {
    t: "21:18:10",
    txt: "SMS + push alerts sent to 3 staff",
    dot: "pulse-amber",
  },
  { t: "21:18:15", txt: "First responder ETA locked: 2:47", dot: "pulse-blue" },
  { t: "21:14:31", txt: "Anomaly detected — B2 Camera Feed", dot: "pulse-red" },
  {
    t: "21:14:33",
    txt: "Security Alpha & Beta dispatched",
    dot: "pulse-amber",
  },
  {
    t: "20:58:00",
    txt: "Ballroom East fire alarm triggered",
    dot: "pulse-red",
  },
  {
    t: "20:58:40",
    txt: "Fire Unit 2 responded — incident closed",
    dot: "pulse-green",
  },
];

function FloorMapSVG({ incidents }) {
  // Helper to map location string to SVG coordinates
  const getCoords = (location) => {
    const loc = location?.toLowerCase() || "";
    if (loc.includes("1204") || loc.includes("floor 12"))
      return { x: 290, y: 55, color: "var(--red)" };
    if (loc.includes("parking") || loc.includes("b2"))
      return { x: 300, y: 170, color: "var(--amber)" };
    if (loc.includes("ballroom"))
      return { x: 410, y: 270, color: "var(--green)" };
    if (loc.includes("pool") || loc.includes("floor 1"))
      return { x: 150, y: 270, color: "var(--blue)" };
    return { x: 100, y: 100, color: "var(--blue)" };
  };

  return (
    <svg viewBox="0 0 600 340" style={{ width: "100%", height: "100%" }}>
      {/* grid */}
      {Array.from({ length: 16 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * 40}
          y1={0}
          x2={i * 40}
          y2={340}
          stroke="rgba(0,200,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={i * 40}
          x2={600}
          y2={i * 40}
          stroke="rgba(0,200,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {/* hotel outline */}
      <rect
        x="30"
        y="20"
        width="540"
        height="300"
        rx="8"
        fill="rgba(0,200,255,0.02)"
        stroke="rgba(0,200,255,0.15)"
        strokeWidth="1"
      />
      {/* lobby */}
      <rect
        x="50"
        y="250"
        width="200"
        height="60"
        rx="4"
        fill="rgba(0,200,255,0.06)"
        stroke="rgba(0,200,255,0.15)"
        strokeWidth="1"
      />
      <text
        x="150"
        y="285"
        textAnchor="middle"
        fill="rgba(0,200,255,0.5)"
        fontSize="10"
        fontFamily="var(--font-mono)"
      >
        LOBBY / FLOOR 1
      </text>
      {/* ballroom */}
      <rect
        x="270"
        y="250"
        width="280"
        height="60"
        rx="4"
        fill="rgba(0,200,255,0.04)"
        stroke="rgba(0,200,255,0.15)"
        strokeWidth="1"
      />
      <text
        x="410"
        y="285"
        textAnchor="middle"
        fill="rgba(0,200,255,0.5)"
        fontSize="10"
        fontFamily="var(--font-mono)"
      >
        BALLROOM EAST
      </text>
      {/* rooms - floor 12 */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={50 + i * 80}
          y={40}
          width="70"
          height="50"
          rx="4"
          fill="rgba(0,200,255,0.04)"
          stroke="rgba(0,200,255,0.1)"
          strokeWidth="1"
        />
      ))}
      <text
        x="290"
        y="70"
        textAnchor="middle"
        fill="rgba(0,200,255,0.4)"
        fontSize="10"
        fontFamily="var(--font-mono)"
      >
        FLOOR 12 GUEST ROOMS
      </text>
      {/* parking */}
      <rect
        x="50"
        y="110"
        width="500"
        height="120"
        rx="4"
        fill="rgba(0,200,255,0.02)"
        stroke="rgba(0,200,255,0.1)"
        strokeWidth="1"
      />
      <text
        x="300"
        y="175"
        textAnchor="middle"
        fill="rgba(0,200,255,0.4)"
        fontSize="10"
        fontFamily="var(--font-mono)"
      >
        B2 PARKING AREA
      </text>

      {/* dynamic incident pins */}
      {incidents.map((inc, i) => {
        const { x, y, color } = getCoords(inc.location);
        const isCritical =
          inc.sev === "CRITICAL" || inc.severity === "CRITICAL";
        const isResolved = inc.status === "RESOLVED";

        return (
          <g key={inc.id || i} transform={`translate(${x},${y})`}>
            {!isResolved && (
              <circle r="12" fill={color} opacity="0.2">
                <animate
                  attributeName="r"
                  values="12;20;12"
                  dur={isCritical ? "1.2s" : "2s"}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0.1;0.3"
                  dur={isCritical ? "1.2s" : "2s"}
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle r={6} fill={isResolved ? "var(--green)" : color} />
            <text
              y="3"
              textAnchor="middle"
              fill="#fff"
              fontSize="8"
              fontWeight="900"
            >
              {isResolved ? "✓" : "!"}
            </text>
          </g>
        );
      })}

      {/* staff dots - simplified */}
      <circle cx="270" cy="80" r="4" fill="var(--blue)" opacity="0.8" />
      <circle cx="320" cy="180" r="4" fill="var(--blue)" opacity="0.8" />
      <circle cx="100" cy="280" r="4" fill="var(--blue)" opacity="0.8" />
    </svg>
  );
}

export default function DashboardPage() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [timeline, setTimeline] = useState(TIMELINE);
  const [selected, setSelected] = useState(INITIAL_INCIDENTS[0]);
  const [time, setTime] = useState("");

  useEffect(() => {
    // Fetch existing incidents
    fetch(`${BACKEND_URL}/api/incidents`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const formatted = data.map((inc) => ({
            ...inc,
            ts: new Date(inc.createdAt).toLocaleTimeString(),
            sev: inc.severity,
            status: inc.status === "OPEN" ? "ACTIVE" : inc.status,
            ai: inc.metadata
              ? JSON.parse(inc.metadata).summary
              : "Analyzing...",
            assigned: "First Response Team",
            eta: inc.severity === "CRITICAL" ? "2:00" : "5:00",
            color: inc.severity === "CRITICAL" ? "var(--red)" : "var(--amber)",
          }));
          setIncidents(formatted);
          setSelected(formatted[0]);
        }
      })
      .catch((err) => console.error("Failed to fetch incidents:", err));

    const channel = pusher.subscribe("sentinel-channel");
    
    channel.bind("incident-update", (newIncident) => {
      setIncidents((prev) => {
        const index = prev.findIndex((inc) => inc.id === newIncident.id);
        const formatted = {
          ...newIncident,
          ts: new Date().toLocaleTimeString(),
          sev: newIncident.severity,
          status: newIncident.status === "OPEN" ? "ACTIVE" : newIncident.status,
          ai: newIncident.metadata
            ? typeof newIncident.metadata === "string"
              ? JSON.parse(newIncident.metadata).summary
              : newIncident.metadata.summary
            : "Analyzing...",
          assigned: "Dispatched",
          eta: newIncident.severity === "CRITICAL" ? "1:45" : "4:30",
          color:
            newIncident.severity === "CRITICAL" ? "var(--red)" : "var(--amber)",
        };

        if (index !== -1) {
          const updated = [...prev];
          updated[index] = formatted;
          return updated;
        }
        return [formatted, ...prev];
      });

      setTimeline((prev) => [
        {
          t: new Date().toLocaleTimeString(),
          txt: `${newIncident.type} at ${newIncident.location} - Status: ${newIncident.status}`,
          dot:
            newIncident.severity === "CRITICAL" ? "pulse-red" : "pulse-amber",
        },
        ...prev,
      ]);
    });

    return () => {
      pusher.unsubscribe("sentinel-channel");
    };
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/incidents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, status: data.status } : inc)),
      );
      if (selected?.id === id) {
        setSelected({ ...selected, status: data.status });
      }
    } catch (err) {
      console.error("Failed to update incident status:", err);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const triggerScenario = async (s) => {
    try {
      await fetch(`${BACKEND_URL}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: s.type,
          severity: s.type === "FIRE" || s.type === "MEDICAL" ? "CRITICAL" : "HIGH",
          zone: s.location.split(" · ")[0],
          floor: s.location.split(" · ")[1].replace("Floor ", ""),
          source: s.source,
          description: s.desc
        }),
      });
    } catch (err) {
      console.error("Failed to trigger scenario:", err);
    }
  };

  // Dynamic stats
  const stats = {
    active: incidents.filter((i) => i.status === "ACTIVE").length,
    critical: incidents.filter((i) => i.sev === "CRITICAL").length,
    resolved: incidents.filter((i) => i.status === "RESOLVED").length,
    total: incidents.length,
  };

  return (
    <main
      style={{
        paddingTop: 64,
        minHeight: "100vh",
        background: "var(--bg-void)",
      }}
      className="grid-bg"
    >
      <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
        {/* header */}
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
              🖥️ War Room{" "}
              <span
                className="glow-blue"
                style={{ fontFamily: "var(--font-mono)", fontSize: 18 }}
              >
                LIVE
              </span>
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
                fontFamily: "var(--font-mono)",
              }}
            >
              RCIO Command Center · {time}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/triage" className="btn btn-ghost">
              🧠 AI Triage
            </Link>
            <Link href="/sos" className="btn btn-danger">
              🆘 New SOS
            </Link>
          </div>
        </div>

        {/* top stats */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            {
              label: "Active Incidents",
              val: stats.active,
              color: "var(--red)",
              icon: "🔴",
            },
            {
              label: "Critical Priority",
              val: stats.critical,
              color: "var(--amber)",
              icon: "🔥",
            },
            {
              label: "Resolved Today",
              val: stats.resolved,
              color: "var(--green)",
              icon: "✅",
            },
            {
              label: "Total Alerts",
              val: stats.total,
              color: "var(--blue)",
              icon: "📊",
            },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">
                {s.icon} {s.label}
              </div>
              <div
                className="stat-value"
                style={{ color: s.color, fontSize: 32 }}
              >
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {/* main grid */}
        <div className="war-room-grid">
          {/* incidents list */}
          <div
            className="glass"
            style={{ display: "flex", flexDirection: "column", height: 500 }}
          >
            <div className="panel-header">
              <span className="panel-title">Active Incidents</span>
              <span className="badge badge-red">{stats.active} LIVE</span>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`incident-item ${selected?.id === inc.id ? "selected" : ""}`}
                  onClick={() => setSelected(inc)}
                >
                  <span
                    className={`pulse-dot ${inc.status === "ACTIVE" ? (inc.sev === "CRITICAL" ? "pulse-red" : "pulse-amber") : "pulse-green"}`}
                    style={{ marginTop: 4 }}
                  />
                  <div>
                    <div className="flex-between">
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color:
                            inc.sev === "CRITICAL"
                              ? "var(--red)"
                              : "var(--amber)",
                        }}
                      >
                        {inc.type}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-muted)",
                        }}
                      >
                        {inc.id.toString().slice(-4)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginTop: 4,
                      }}
                    >
                      {inc.location}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        marginTop: 4,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {inc.ts}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* floor map */}
          <div
            className="glass"
            style={{ padding: 0, display: "flex", flexDirection: "column" }}
          >
            <div className="panel-header">
              <span className="panel-title">Live Floor Map</span>
              <div style={{ display: "flex", gap: 12, fontSize: 10 }}>
                <span style={{ color: "var(--red)" }}>● Critical</span>
                <span style={{ color: "var(--blue)" }}>● Staff</span>
              </div>
            </div>
            <div
              className="floor-map"
              style={{ flex: 1, minHeight: 400, padding: 20 }}
            >
              <FloorMapSVG incidents={incidents} />
            </div>
          </div>

          {/* incident detail */}
          <div
            className="glass"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <div className="panel-header">
              <span className="panel-title">Incident Details</span>
            </div>
            <div
              style={{
                padding: 20,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {selected ? (
                <>
                  <div
                    className={`alert-banner ${selected.sev === "CRITICAL" ? "alert-critical" : "alert-warning"}`}
                    style={{
                      padding: 16,
                      borderRadius: "var(--radius-md)",
                      background:
                        selected.sev === "CRITICAL"
                          ? "var(--red-glow)"
                          : "var(--amber-glow)",
                      border: `1px solid ${selected.sev === "CRITICAL" ? "var(--red)" : "var(--amber)"}`,
                      display: "flex",
                      gap: 16,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>
                      {selected.sev === "CRITICAL" ? "🚨" : "⚠️"}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>
                        {selected.type}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.9 }}>
                        {selected.location}
                      </div>
                    </div>
                  </div>

                  <div className="glass-sm" style={{ padding: 16 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        marginBottom: 6,
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                      }}
                    >
                      AI ANALYSIS & TRIAGE
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--blue)",
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      {selected.ai}
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="glass-sm" style={{ padding: 12 }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        STATUS
                      </div>
                      <span
                        className={`badge ${selected.status === "ACTIVE" ? "badge-red" : "badge-green"}`}
                      >
                        {selected.status}
                      </span>
                    </div>
                    <div className="glass-sm" style={{ padding: 12 }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        ETA
                      </div>
                      <span className="eta-badge">{selected.eta}</span>
                    </div>
                  </div>

                  <div className="glass-sm" style={{ padding: 16 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        marginBottom: 6,
                        fontWeight: 800,
                      }}
                    >
                      RESPONSE TEAM
                    </div>
                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => handleStatusUpdate(selected.id, "RESOLVED")}
                        >
                          Resolve
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ flex: 1 }}
                          onClick={async () => {
                            await fetch(`${BACKEND_URL}/api/incidents/${selected.id}/dispatch`, { method: "POST" });
                            alert("Manual Dispatch SMS Sent to Staff!");
                          }}
                        >
                          Manual Dispatch
                        </button>
                      </div>
                      <button 
                        className="btn btn-ghost" 
                        style={{ width: "100%" }}
                        onClick={() => window.open(`${BACKEND_URL}/api/incidents/${selected.id}/report`, "_blank")}
                      >
                        PDF Report
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    color: "var(--text-muted)",
                    textAlign: "center",
                    marginTop: 40,
                  }}
                >
                  Select an incident to view details
                </div>
              )}
            </div>
          </div>
        </div>

        {/* bottom row */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {/* staff status */}
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              Response Personnel
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {STAFF.slice(0, 4).map((s, i) => (
                <div
                  key={i}
                  className="glass-sm"
                  style={{
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--blue-glow)",
                      border: "1px solid var(--blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyCenter: "center",
                      fontSize: 14,
                    }}
                  >
                    {s.role === "Security"
                      ? "🛡️"
                      : s.role === "Nurse"
                        ? "💊"
                        : "🔥"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {s.role} · Floor {s.floor}
                    </div>
                  </div>
                  <span
                    className={`badge ${s.status === "STANDBY" ? "badge-blue" : "badge-red"}`}
                    style={{ fontSize: 9 }}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* activity timeline */}
          <div className="glass" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              Activity Timeline
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {timeline.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <div className={`pulse-dot ${item.dot}`} style={{ marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{item.t}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.txt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* crisis playbook */}
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              Crisis Playbook (Demo Simulator)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  className="btn btn-ghost"
                  style={{ fontSize: 12, padding: "10px", justifyContent: "flex-start" }}
                  onClick={() => triggerScenario(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* operational log */}
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              Operational Log
            </div>
            <div
              className="timeline"
              style={{ maxHeight: 180, overflowY: "auto" }}
            >
              {timeline.slice(0, 5).map((e, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-line">
                    <span
                      className={`pulse-dot ${e.dot}`}
                      style={{ width: 8, height: 8 }}
                    />
                    {i < 4 && <div className="tl-connector" />}
                  </div>
                  <div className="tl-content">
                    <div className="tl-time" style={{ fontSize: 10 }}>
                      {e.t}
                    </div>
                    <div className="tl-text" style={{ fontSize: 11 }}>
                      {e.txt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
