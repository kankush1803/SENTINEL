"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

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

function ETATimer({ init }) {
  const [secs, setSecs] = useState(init);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(secs / 60),
    s = secs % 60;
  return (
    <span className="eta-badge">
      ⏱ {m}:{String(s).padStart(2, "0")}
    </span>
  );
}

function FloorMapSVG({ incidents }) {
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
        fill="rgba(0,200,255,0.04)"
        stroke="rgba(0,200,255,0.2)"
        strokeWidth="1.5"
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
        fontSize="11"
        fontFamily="Inter"
      >
        LOBBY
      </text>
      {/* ballroom */}
      <rect
        x="270"
        y="250"
        width="280"
        height="60"
        rx="4"
        fill="rgba(255,59,92,0.05)"
        stroke="rgba(255,59,92,0.2)"
        strokeWidth="1"
      />
      <text
        x="410"
        y="285"
        textAnchor="middle"
        fill="rgba(255,59,92,0.6)"
        fontSize="11"
        fontFamily="Inter"
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
          fill={i === 3 ? "rgba(255,59,92,0.15)" : "rgba(0,200,255,0.04)"}
          stroke={i === 3 ? "rgba(255,59,92,0.5)" : "rgba(0,200,255,0.12)"}
          strokeWidth="1"
        />
      ))}
      <text
        x="290"
        y="70"
        textAnchor="middle"
        fill="rgba(255,59,92,0.7)"
        fontSize="10"
        fontFamily="Inter"
      >
        Rm 1204
      </text>
      {/* parking */}
      <rect
        x="50"
        y="110"
        width="500"
        height="120"
        rx="4"
        fill="rgba(255,179,71,0.04)"
        stroke="rgba(255,179,71,0.15)"
        strokeWidth="1"
      />
      <text
        x="300"
        y="175"
        textAnchor="middle"
        fill="rgba(255,179,71,0.5)"
        fontSize="11"
        fontFamily="Inter"
      >
        B2 PARKING — ZONE C
      </text>
      {/* incident pins */}
      <g transform="translate(290,55)">
        <circle
          r="14"
          fill="rgba(255,59,92,0.2)"
          stroke="var(--red)"
          strokeWidth="1.5"
        >
          <animate
            attributeName="r"
            values="14;22;14"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="7" fill="var(--red)" />
        <text
          y="4"
          textAnchor="middle"
          fill="#fff"
          fontSize="9"
          fontWeight="700"
        >
          !
        </text>
      </g>
      <g transform="translate(300,170)">
        <circle
          r="14"
          fill="rgba(255,179,71,0.2)"
          stroke="var(--amber)"
          strokeWidth="1.5"
        >
          <animate
            attributeName="r"
            values="14;22;14"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="7" fill="var(--amber)" />
        <text
          y="4"
          textAnchor="middle"
          fill="#fff"
          fontSize="9"
          fontWeight="700"
        >
          !
        </text>
      </g>
      {/* resolved pin */}
      <g transform="translate(410,270)">
        <circle r="7" fill="var(--green)" opacity="0.7" />
        <text
          y="4"
          textAnchor="middle"
          fill="#fff"
          fontSize="9"
          fontWeight="700"
        >
          ✓
        </text>
      </g>
      {/* staff dots */}
      <circle cx="295" cy="95" r="5" fill="var(--blue)" opacity="0.9">
        <animate
          attributeName="opacity"
          values="0.9;0.4;0.9"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="310" cy="95" r="5" fill="var(--blue)" opacity="0.9">
        <animate
          attributeName="opacity"
          values="0.9;0.4;0.9"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="270" cy="165" r="5" fill="var(--blue)" opacity="0.9">
        <animate
          attributeName="opacity"
          values="0.9;0.4;0.9"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </circle>
      {/* labels */}
      <text
        x="300"
        y="15"
        textAnchor="middle"
        fill="rgba(0,200,255,0.4)"
        fontSize="10"
        fontFamily="Inter"
        fontWeight="600"
      >
        FLOOR 12 — LIVE VIEW
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [timeline, setTimeline] = useState(TIMELINE);

  useEffect(() => {
    // Fetch existing incidents
    fetch("http://localhost:3001/api/incidents")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const formatted = data.map((inc) => ({
            ...inc,
            ts: new Date(inc.createdAt).toLocaleTimeString(),
            sev: inc.severity,
            color: inc.severity === "CRITICAL" ? "var(--red)" : "var(--amber)",
          }));
          setIncidents(formatted);
        }
      })
      .catch((err) => console.error("Failed to fetch incidents:", err));

    socket.on("incident-update", (newIncident) => {
      console.log("Received incident update:", newIncident);

      setIncidents((prev) => {
        const index = prev.findIndex((inc) => inc.id === newIncident.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...newIncident,
            ts: new Date().toLocaleTimeString(),
          };
          return updated;
        }
        return [
          { ...newIncident, ts: new Date().toLocaleTimeString() },
          ...prev,
        ];
      });

      setTimeline((prev) => [
        {
          t: new Date().toLocaleTimeString(),
          txt: `Incident updated: ${newIncident.type} at ${newIncident.location}`,
          dot: "pulse-red",
        },
        ...prev,
      ]);
    });

    return () => socket.off("incident-update");
  }, []);
  const [selected, setSelected] = useState(INITIAL_INCIDENTS[0]);
  const [time, setTime] = useState("");
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
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
                color: "var(--text-muted)",
                fontSize: 13,
                fontFamily: "var(--font-mono)",
              }}
            >
              RCIO Command Center · {time}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/triage"
              className="btn btn-ghost"
              style={{ fontSize: 13 }}
            >
              🧠 AI Triage
            </Link>
            <Link
              href="/sos"
              className="btn btn-danger"
              style={{ fontSize: 13 }}
            >
              🆘 New SOS
            </Link>
          </div>
        </div>

        {/* top stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Active Incidents",
              val: "2",
              color: "var(--red)",
              icon: "🔴",
            },
            {
              label: "Staff Deployed",
              val: "4",
              color: "var(--amber)",
              icon: "👥",
            },
            {
              label: "Avg Response Time",
              val: "1:52",
              color: "var(--blue)",
              icon: "⏱",
            },
            {
              label: "Incidents Today",
              val: "7",
              color: "var(--green)",
              icon: "📋",
            },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">
                {s.icon} {s.label}
              </div>
              <div
                className="stat-value"
                style={{ color: s.color, fontSize: 30 }}
              >
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {/* main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* incidents list */}
          <div className="glass" style={{ padding: 20 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Active Incidents
              <span className="badge badge-red">
                {incidents.filter((i) => i.status === "ACTIVE").length} LIVE
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="incident-row"
                  onClick={() => setSelected(inc)}
                  style={{
                    borderColor:
                      selected?.id === inc.id ? "var(--blue)" : "var(--border)",
                  }}
                >
                  <span
                    className={`pulse-dot ${inc.status === "ACTIVE" ? (inc.sev === "CRITICAL" ? "pulse-red" : "pulse-amber") : "pulse-green"}`}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color:
                            inc.sev === "CRITICAL"
                              ? "var(--red)"
                              : inc.sev === "HIGH"
                                ? "var(--amber)"
                                : "var(--green)",
                        }}
                      >
                        {inc.type}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--text-muted)",
                        }}
                      >
                        {inc.id}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {inc.location}
                    </div>
                    {inc.status === "ACTIVE" && (
                      <div style={{ marginTop: 6 }}>
                        <ETATimer init={inc.id === "#1047" ? 167 : 252} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* floor map */}
          <div className="glass" style={{ padding: 20 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              Live Floor Map
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--red)" }}>● Critical</span>
                <span style={{ color: "var(--amber)" }}>● High</span>
                <span style={{ color: "var(--blue)" }}>● Staff</span>
                <span style={{ color: "var(--green)" }}>● Resolved</span>
              </div>
            </div>
            <div className="floor-map" style={{ height: 300 }}>
              <FloorMapSVG incidents={incidents} />
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              {["Floor 12", "B2 Parking", "Ballroom", "All Floors"].map((f) => (
                <button
                  key={f}
                  className="btn btn-ghost"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* incident detail */}
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              Incident Detail — {selected?.id}
            </div>
            {selected && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  className={`alert-banner ${selected.sev === "CRITICAL" ? "alert-critical" : selected.sev === "HIGH" ? "alert-warning" : "alert-info"}`}
                >
                  <span style={{ fontSize: 20 }}>
                    {selected.sev === "CRITICAL"
                      ? "🚨"
                      : selected.sev === "HIGH"
                        ? "⚠️"
                        : "ℹ️"}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {selected.type}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {selected.location}
                    </div>
                  </div>
                </div>
                <div className="glass-sm" style={{ padding: 14 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                    }}
                  >
                    AI CLASSIFICATION
                  </div>
                  <div style={{ fontSize: 13, color: "var(--blue)" }}>
                    {selected.ai}
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div className="glass-sm" style={{ padding: 12 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 4,
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
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      ETA
                    </div>
                    <span
                      style={{
                        color: "var(--amber)",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {selected.eta}
                    </span>
                  </div>
                </div>
                <div className="glass-sm" style={{ padding: 14 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    ASSIGNED STAFF
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {selected.assigned}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href="/staff"
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center", fontSize: 12 }}
                  >
                    👥 Staff Ops
                  </Link>
                  <Link
                    href="/report"
                    className="btn btn-ghost"
                    style={{ flex: 1, justifyContent: "center", fontSize: 12 }}
                  >
                    📋 Report
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* bottom row */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {/* staff status */}
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              Staff Status Board
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STAFF.map((s, i) => (
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
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--blue-glow)",
                      border: "1px solid var(--blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {s.role === "Security"
                      ? "🛡️"
                      : s.role === "Nurse"
                        ? "💊"
                        : s.role === "Fire Safety"
                          ? "🔥"
                          : "🎩"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {s.name}{" "}
                      <span
                        style={{ fontSize: 11, color: "var(--text-muted)" }}
                      >
                        · {s.role}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Floor {s.floor} {s.incident ? `· ${s.incident}` : ""}
                    </div>
                  </div>
                  <span
                    className={`badge ${s.status === "RESPONDING" || s.status === "ENROUTE" ? "badge-red" : s.status === "RESOLVED" ? "badge-green" : "badge-blue"}`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* activity timeline */}
          <div
            className="glass"
            style={{ padding: 20, overflowY: "auto", maxHeight: 360 }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              Activity Timeline
            </div>
            <div className="timeline">
              {timeline.map((e, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-line">
                    <span
                      className={`pulse-dot ${e.dot}`}
                      style={{ width: 10, height: 10 }}
                    />
                    {i < timeline.length - 1 && (
                      <div className="tl-connector" />
                    )}
                  </div>
                  <div className="tl-content">
                    <div className="tl-time">{e.t}</div>
                    <div className="tl-text">{e.txt}</div>
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
