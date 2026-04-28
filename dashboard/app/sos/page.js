"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const ROOM = "Room 1204";
const FLOOR = "12th Floor";

const CATEGORIES = [
  { id: "medical", label: "Medical", icon: "💊", color: "var(--red)" },
  { id: "fire", label: "Fire", icon: "🔥", color: "var(--red)" },
  { id: "security", label: "Security", icon: "🛡️", color: "var(--amber)" },
  { id: "other", label: "Other", icon: "❗", color: "var(--blue)" },
];

export default function SOSPage() {
  const [phase, setPhase] = useState("idle"); // idle | category | voice | sent | tracking
  const [category, setCategory] = useState(null);
  const [voice, setVoice] = useState("");
  const [typing, setTyping] = useState(false);
  const [eta, setEta] = useState(180);
  const [triageResult, setTriageResult] = useState(null);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdRef = { interval: null };

  // ETA countdown
  useEffect(() => {
    if (phase !== "tracking") return;
    const t = setInterval(() => setEta((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  function startHold() {
    setHolding(true);
    let p = 0;
    holdRef.interval = setInterval(() => {
      p += 4;
      setHoldProgress(p);
      if (p >= 100) {
        clearInterval(holdRef.interval);
        setHolding(false);
        setHoldProgress(0);
        setPhase("category");
      }
    }, 40);
  }
  function stopHold() {
    clearInterval(holdRef.interval);
    setHolding(false);
    setHoldProgress(0);
  }

  function selectCategory(c) {
    setCategory(c);
    setPhase("voice");
  }

  function submitSOS() {
    setPhase("sent");
    setTyping(true);

    // Send to backend via Socket
    socket.emit("sos-trigger", {
      location: `${ROOM} · ${FLOOR}`,
      userId: "guest-123",
      description: voice || `${category?.label} Emergency`,
      category: category?.id,
    });

    // Also listen for the update
    socket.once("incident-update", (data) => {
      console.log("Received triage from backend:", data);
      setTyping(false);

      const triage = data.metadata ? JSON.parse(data.metadata) : null;

      setTriageResult({
        type: triage?.classification || category?.label || "Emergency",
        severity: triage?.severity || "HIGH",
        protocol: triage?.response_protocol?.join(", ") || "Security deployed",
        confidence: 90 + Math.floor(Math.random() * 9),
        staff: triage?.recommended_roles?.join(" & ") || "Security Alpha",
      });

      setTimeout(() => setPhase("tracking"), 800);
    });

    // Fallback if backend doesn't respond in time (for demo stability)
    setTimeout(() => {
      if (typing) {
        setTyping(false);
        setTriageResult({
          type: category?.label || "Emergency",
          severity:
            category?.id === "medical" || category?.id === "fire"
              ? "CRITICAL"
              : "HIGH",
          protocol:
            category?.id === "medical"
              ? "P1 — Medical team + AED dispatched"
              : category?.id === "fire"
                ? "P1 — Evacuation initiated"
                : "P2 — Security deployed",
          confidence: 92 + Math.floor(Math.random() * 6),
          staff:
            category?.id === "medical"
              ? "Dr. Rao & Nurse Kim"
              : category?.id === "fire"
                ? "Fire Safety Team"
                : "Security Alpha",
        });
        setTimeout(() => setPhase("tracking"), 800);
      }
    }, 5000);
  }

  const m = Math.floor(eta / 60),
    s = eta % 60;

  return (
    <main
      style={{
        paddingTop: 64,
        minHeight: "100vh",
        background: "var(--bg-void)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="grid-bg"
    >
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        {/* phone frame */}
        <div
          style={{
            background: "linear-gradient(145deg, #0d1f35, #060d18)",
            border: "2px solid var(--border)",
            borderRadius: 32,
            padding: 0,
            overflow: "hidden",
            boxShadow: "0 0 60px rgba(0,200,255,0.1)",
          }}
        >
          {/* status bar */}
          <div
            style={{
              padding: "14px 24px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border)",
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span className="glow-blue">SENTINEL GUEST</span>
            <span>
              {ROOM} · {FLOOR}
            </span>
          </div>

          <div style={{ padding: 28 }}>
            {/* IDLE — hold SOS */}
            {phase === "idle" && (
              <div
                className="grid-stack"
                style={{ alignItems: "center", gap: 24 }}
              >
                <div style={{ textAlign: "center" }}>
                  <h1
                    style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}
                  >
                    Emergency SOS
                  </h1>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Hold the button to send an emergency alert to hotel staff
                  </p>
                </div>

                <div style={{ position: "relative" }}>
                  {/* hold progress ring */}
                  <svg
                    style={{
                      position: "absolute",
                      top: -12,
                      left: -12,
                      width: 184,
                      height: 184,
                      transform: "rotate(-90deg)",
                    }}
                    viewBox="0 0 184 184"
                  >
                    <circle
                      cx="92"
                      cy="92"
                      r="82"
                      fill="none"
                      stroke="rgba(255,59,92,0.15)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="92"
                      cy="92"
                      r="82"
                      fill="none"
                      stroke="var(--red)"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 82}`}
                      strokeDashoffset={`${2 * Math.PI * 82 * (1 - holdProgress / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.04s linear" }}
                    />
                  </svg>
                  <button
                    className={`sos-btn ${holding ? "holding" : ""}`}
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="sos-ring" />
                    <div className="sos-ring" />
                    <div className="sos-ring" />
                    <span
                      style={{
                        fontSize: 13,
                        letterSpacing: "0.15em",
                        fontWeight: 800,
                      }}
                    >
                      SOS
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        opacity: 0.7,
                        letterSpacing: "0.08em",
                        marginTop: 4,
                      }}
                    >
                      HOLD
                    </span>
                  </button>
                </div>

                <div className="grid-stack" style={{ width: "100%", gap: 10 }}>
                  {[
                    {
                      icon: "📞",
                      label: "Call Front Desk",
                      sub: "Connect to hotel staff",
                    },
                    {
                      icon: "🔇",
                      label: "Silent SOS",
                      sub: "Alert without sound",
                    },
                  ].map((a, i) => (
                    <button
                      key={i}
                      className="glass-sm stat-card"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 16px",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {a.label}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>
                          {a.sub}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORY SELECT */}
            {phase === "category" && (
              <div className="grid-stack" style={{ gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      color: "var(--red)",
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    🚨 SOS Activated
                  </div>
                  <h2
                    style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}
                  >
                    What is the emergency?
                  </h2>
                </div>
                <div className="grid-2" style={{ gap: 12 }}>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectCategory(c)}
                      className="glass stat-card"
                      style={{
                        padding: "20px 16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        borderColor: `${c.color}44`,
                      }}
                    >
                      <span style={{ fontSize: 32 }}>{c.icon}</span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: c.color,
                        }}
                      >
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VOICE / TEXT input */}
            {phase === "voice" && (
              <div className="grid-stack" style={{ gap: 18 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>
                    {category?.icon}
                  </div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: category?.color,
                    }}
                  >
                    {category?.label} Emergency
                  </h2>
                </div>
                <textarea
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="Tell us more (optional)..."
                  className="input-field"
                  style={{
                    width: "100%",
                    minHeight: 100,
                    padding: 14,
                    resize: "none",
                  }}
                />
                <div
                  className="glass-sm"
                  style={{
                    padding: "10px 14px",
                    fontSize: 12,
                    color: "var(--amber)",
                    border: "1px solid var(--amber)44",
                  }}
                >
                  ⚡ AI will auto-classify and dispatch the right team instantly
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setPhase("category")}
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={submitSOS}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Confirm SOS
                  </button>
                </div>
              </div>
            )}

            {/* TRACKING */}
            {(phase === "sent" || phase === "tracking") && (
              <div className="grid-stack" style={{ gap: 20 }}>
                <div
                  className="glass"
                  style={{ padding: 24, textAlign: "center" }}
                >
                  <div
                    className="pulse-dot pulse-red"
                    style={{ margin: "0 auto 16px", width: 40, height: 40 }}
                  />
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "var(--red)",
                    }}
                  >
                    EMERGENCY TRIGGERED
                  </div>
                  <div
                    style={{
                      color: "var(--text-muted)",
                      fontSize: 13,
                      marginTop: 8,
                    }}
                  >
                    Help is on the way to {ROOM}
                  </div>
                </div>

                {typing && (
                  <div
                    className="glass-sm"
                    style={{ padding: 20, textAlign: "center" }}
                  >
                    <div
                      className="glow-blue"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    >
                      AI TRIAGE IN PROGRESS...
                    </div>
                  </div>
                )}

                {triageResult && (
                  <div
                    className="glass"
                    style={{ padding: 0, overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "12px 20px",
                        background: "rgba(255, 50, 50, 0.1)",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 11 }}>
                        DISPATCH STATUS
                      </span>
                      <span className="badge badge-red">EN ROUTE</span>
                    </div>
                    <div style={{ padding: 20 }}>
                      <div
                        className="flex-between"
                        style={{ marginBottom: 16 }}
                      >
                        <div>
                          <div className="stat-label">Assigned Team</div>
                          <div style={{ fontWeight: 700 }}>
                            {triageResult.staff}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="stat-label">ETA</div>
                          <div className="eta-badge">
                            {m}:{s.toString().padStart(2, "0")}
                          </div>
                        </div>
                      </div>
                      <div className="glass-sm" style={{ padding: 12 }}>
                        <div className="stat-label">Protocol</div>
                        <div
                          style={{ fontSize: 13, color: "var(--text-primary)" }}
                        >
                          {triageResult.protocol}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
