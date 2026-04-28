"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const INITIAL_TASKS = [
  {
    id: "T001",
    staff: "Dr. Priya Rao",
    role: "Medical",
    incident: "#1047",
    floor: "12",
    room: "1204",
    task: "Respond to cardiac emergency with AED",
    status: "ENROUTE",
    priority: "CRITICAL",
    ts: "21:18:07",
  },
  {
    id: "T002",
    staff: "Nurse Kim Lee",
    role: "Medical",
    incident: "#1047",
    floor: "12",
    room: "1204",
    task: "Bring medical kit and oxygen",
    status: "ENROUTE",
    priority: "CRITICAL",
    ts: "21:18:07",
  },
  {
    id: "T003",
    staff: "Raj Kumar",
    role: "Security",
    incident: "#1046",
    floor: "B2",
    room: "C",
    task: "Intercept suspicious individual",
    status: "RESPONDING",
    priority: "HIGH",
    ts: "21:14:33",
  },
  {
    id: "T004",
    staff: "Ali Hassan",
    role: "Security",
    incident: "#1046",
    floor: "B2",
    room: "C",
    task: "Review CCTV Zone C footage live",
    status: "RESPONDING",
    priority: "HIGH",
    ts: "21:14:35",
  },
  {
    id: "T005",
    staff: "Tom Lee",
    role: "Concierge",
    incident: "#1047",
    floor: "12",
    room: "1204",
    task: "Escort paramedics from lobby to 12F",
    status: "STANDBY",
    priority: "HIGH",
    ts: "21:18:10",
  },
  {
    id: "T006",
    staff: "Sara Patel",
    role: "Fire Safety",
    incident: "#1045",
    floor: "3",
    room: "BE",
    task: "Ballroom East post-incident check",
    status: "COMPLETE",
    priority: "LOW",
    ts: "20:58:40",
  },
];

const STAFF_LIST = [
  {
    name: "Dr. Priya Rao",
    role: "Medical",
    floor: "12",
    status: "ENROUTE",
    avatar: "👩‍⚕️",
    battery: 78,
    signal: "●●●",
  },
  {
    name: "Nurse Kim Lee",
    role: "Medical",
    floor: "11",
    status: "ENROUTE",
    avatar: "💊",
    battery: 91,
    signal: "●●●",
  },
  {
    name: "Raj Kumar",
    role: "Security",
    floor: "B2",
    status: "RESPONDING",
    avatar: "🛡️",
    battery: 64,
    signal: "●●○",
  },
  {
    name: "Ali Hassan",
    role: "Security",
    floor: "B2",
    status: "RESPONDING",
    avatar: "📹",
    battery: 55,
    signal: "●●○",
  },
  {
    name: "Tom Lee",
    role: "Concierge",
    floor: "L",
    status: "STANDBY",
    avatar: "🎩",
    battery: 88,
    signal: "●●●",
  },
  {
    name: "Sara Patel",
    role: "Fire Safety",
    floor: "3",
    status: "COMPLETE",
    avatar: "🔥",
    battery: 72,
    signal: "●●●",
  },
  {
    name: "Meena Nair",
    role: "Housekeeping",
    floor: "8",
    status: "STANDBY",
    avatar: "🧹",
    battery: 45,
    signal: "●○○",
  },
  {
    name: "Carlos Diaz",
    role: "Maintenance",
    floor: "5",
    status: "STANDBY",
    avatar: "🔧",
    battery: 80,
    signal: "●●●",
  },
];

const BROADCASTS = [
  {
    t: "21:18:07",
    msg: "⚠️ CRITICAL ALERT — Medical emergency Room 1204 Floor 12. All medical staff respond immediately.",
    type: "critical",
  },
  {
    t: "21:14:33",
    msg: "🛡️ HIGH ALERT — Suspicious individual B2 Zone C. Security Alpha + Beta respond now.",
    type: "warning",
  },
  {
    t: "21:10:00",
    msg: "ℹ️ Shift update — Night security patrol briefing at 22:00 in staff room B.",
    type: "info",
  },
  {
    t: "20:58:40",
    msg: "✅ Ballroom East incident resolved. Fire unit stood down. Area clear.",
    type: "success",
  },
];

function StatusDot({ s }) {
  const map = {
    ENROUTE: "pulse-red",
    RESPONDING: "pulse-amber",
    STANDBY: "pulse-blue",
    COMPLETE: "pulse-green",
  };
  return (
    <span
      className={`pulse-dot ${map[s] || "pulse-blue"}`}
      style={{ width: 9, height: 9 }}
    />
  );
}

export default function StaffPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [broadcast, setBroadcast] = useState("");
  const [sent, setSent] = useState(false);
  const [filter, setFilter] = useState("ALL");

  function ackTask(id) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status:
                t.status === "STANDBY"
                  ? "RESPONDING"
                  : t.status === "RESPONDING"
                    ? "COMPLETE"
                    : t.status,
            }
          : t,
      ),
    );
  }

  function sendBroadcast() {
    if (!broadcast.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setBroadcast("");
  }

  const filtered =
    filter === "ALL"
      ? tasks
      : tasks.filter((t) => t.priority === filter || t.status === filter);

  return (
    <main
      style={{
        paddingTop: 64,
        minHeight: "100vh",
        background: "var(--bg-void)",
      }}
      className="grid-bg"
    >
      <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
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
              👥 Staff Operations Center
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Real-time staff tracking, task dispatch, and broadcast
              coordination
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/dashboard"
              className="btn btn-ghost"
              style={{ fontSize: 13 }}
            >
              🖥️ War Room
            </Link>
            <Link
              href="/report"
              className="btn btn-primary"
              style={{ fontSize: 13 }}
            >
              📋 Report
            </Link>
          </div>
        </div>

        {/* broadcast bar */}
        <div
          className="glass"
          style={{
            padding: 16,
            marginBottom: 20,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 18 }}>📡</span>
          <input
            value={broadcast}
            onChange={(e) => setBroadcast(e.target.value)}
            placeholder="Broadcast message to all staff on duty..."
            onKeyDown={(e) => e.key === "Enter" && sendBroadcast()}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              outline: "none",
            }}
          />
          <button
            className={`btn ${sent ? "btn-ghost" : "btn-primary"}`}
            style={{ fontSize: 13, minWidth: 100 }}
            onClick={sendBroadcast}
          >
            {sent ? "✅ Sent!" : "📤 Broadcast"}
          </button>
        </div>

        {/* main grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}
        >
          {/* task board */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* filters */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                "ALL",
                "CRITICAL",
                "HIGH",
                "ENROUTE",
                "RESPONDING",
                "STANDBY",
                "COMPLETE",
              ].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    background:
                      filter === f
                        ? "var(--blue-glow)"
                        : "var(--bg-glass-light)",
                    border: `1px solid ${filter === f ? "var(--blue)" : "var(--border)"}`,
                    color: filter === f ? "var(--blue)" : "var(--text-muted)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="glass" style={{ padding: 20 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                Active Task Queue
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {filtered.length} tasks
                </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {filtered.map((task) => (
                  <div
                    key={task.id}
                    className="glass-sm"
                    style={{
                      padding: 16,
                      borderLeft: `3px solid ${task.priority === "CRITICAL" ? "var(--red)" : task.priority === "HIGH" ? "var(--amber)" : "var(--blue)"}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          {task.staff}
                        </div>
                        <div
                          style={{ fontSize: 11, color: "var(--text-muted)" }}
                        >
                          {task.role} · Floor {task.floor}{" "}
                          {task.room !== task.floor ? `· ${task.room}` : ""} ·{" "}
                          {task.incident}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <span
                          className={`badge ${task.status === "COMPLETE" ? "badge-green" : task.status === "ENROUTE" || task.status === "RESPONDING" ? "badge-red" : "badge-blue"}`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        marginBottom: 10,
                      }}
                    >
                      {task.task}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {task.ts} · {task.id}
                      </span>
                      {task.status !== "COMPLETE" && (
                        <button
                          onClick={() => ackTask(task.id)}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            background: "var(--blue-glow)",
                            border: "1px solid var(--blue)",
                            color: "var(--blue)",
                          }}
                        >
                          {task.status === "STANDBY"
                            ? "Acknowledge →"
                            : "Mark Complete ✓"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* broadcast log */}
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
                📡 Broadcast Log
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {BROADCASTS.map((b, i) => (
                  <div
                    key={i}
                    className={`alert-banner ${b.type === "critical" ? "alert-critical" : b.type === "warning" ? "alert-warning" : b.type === "success" ? "alert-info" : "alert-info"}`}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13 }}>{b.msg}</div>
                      <div
                        style={{
                          fontSize: 11,
                          opacity: 0.6,
                          marginTop: 3,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {b.t}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* staff roster */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
                On-Duty Roster
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontWeight: 400,
                    marginLeft: 10,
                  }}
                >
                  {STAFF_LIST.filter((s) => s.status !== "COMPLETE").length}{" "}
                  active
                </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {STAFF_LIST.map((s, i) => (
                  <div
                    key={i}
                    className="glass-sm"
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "var(--bg-glass)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {s.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                          {s.name}
                        </span>
                        <StatusDot s={s.status} />
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          display: "flex",
                          gap: 10,
                          marginTop: 2,
                        }}
                      >
                        <span>{s.role}</span>
                        <span>Fl.{s.floor}</span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            color:
                              s.battery < 50
                                ? "var(--red)"
                                : "var(--text-muted)",
                          }}
                        >
                          🔋{s.battery}%
                        </span>
                        <span style={{ color: "var(--green)" }}>
                          {s.signal}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge ${s.status === "COMPLETE" ? "badge-green" : s.status === "ENROUTE" || s.status === "RESPONDING" ? "badge-red" : s.status === "STANDBY" ? "badge-blue" : "badge-amber"}`}
                      style={{ fontSize: 10 }}
                    >
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* quick stats */}
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
                Response Metrics
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[
                  {
                    label: "Tasks Completed",
                    val: "1/6",
                    pct: 17,
                    color: "var(--green)",
                  },
                  {
                    label: "Staff Responding",
                    val: "4/8",
                    pct: 50,
                    color: "var(--amber)",
                  },
                  {
                    label: "Coverage",
                    val: "5 Floors",
                    pct: 83,
                    color: "var(--blue)",
                  },
                  {
                    label: "Avg Ack Time",
                    val: "8 sec",
                    pct: 92,
                    color: "var(--blue)",
                  },
                ].map((m, i) => (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginBottom: 6,
                      }}
                    >
                      <span>{m.label}</span>
                      <span style={{ color: m.color, fontWeight: 600 }}>
                        {m.val}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${m.pct}%`,
                          background: `linear-gradient(90deg, ${m.color}88, ${m.color})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
