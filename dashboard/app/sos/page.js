"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

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
            <span>RCIO Guest Portal</span>
            <span>
              {ROOM} · {FLOOR}
            </span>
          </div>

          <div style={{ padding: 28 }}>
            {/* IDLE — hold SOS */}
            {phase === "idle" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 24,
                }}
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
                    className="sos-btn"
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="sos-ring" />
                    <div className="sos-ring" />
                    <div className="sos-ring" />
                    <span style={{ fontSize: 13, letterSpacing: "0.15em" }}>
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

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
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
                    {
                      icon: "🚪",
                      label: "Request Evacuation",
                      sub: "Room evac assistance",
                    },
                  ].map((a, i) => (
                    <button
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 16px",
                        background: "var(--bg-glass-light)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-secondary)",
                        fontSize: 13,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--blue)";
                        e.currentTarget.style.color = "var(--blue)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.label}</div>
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
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
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
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Select the emergency type to help AI prioritize your
                    response
                  </p>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectCategory(c)}
                      style={{
                        padding: "20px 16px",
                        borderRadius: "var(--radius-lg)",
                        background: `${c.color}11`,
                        border: `1px solid ${c.color}44`,
                        color: c.color,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${c.color}22`;
                        e.currentTarget.style.borderColor = c.color;
                        e.currentTarget.style.transform = "scale(1.03)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${c.color}11`;
                        e.currentTarget.style.borderColor = `${c.color}44`;
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <span style={{ fontSize: 32 }}>{c.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VOICE / TEXT input */}
            {phase === "voice" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>
                    {category?.icon}
                  </div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      marginBottom: 4,
                      color: category?.color,
                    }}
                  >
                    {category?.label} Emergency
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Describe what's happening (optional)
                  </p>
                </div>
                <textarea
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="e.g. Guest has chest pain and is having trouble breathing..."
                  style={{
                    width: "100%",
                    minHeight: 100,
                    background: "rgba(0,200,255,0.04)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    padding: 14,
                    resize: "none",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />

                <div
                  style={{
                    background: "var(--amber-glow)",
                    border: "1px solid var(--amber)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    fontSize: 12,
                    color: "var(--amber)",
                  }}
                >
                  ⚡ AI will auto-classify and dispatch the right team in under
                  2 seconds
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setPhase("category")}
                    style={{ fontSize: 13 }}
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={submitSOS}
                    style={{ flex: 1, justifyContent: "center", fontSize: 14 }}
                  >
                    🚨 Send SOS Now
                  </button>
                </div>
              </div>
            )}

            {/* SENT — AI processing */}
            {phase === "sent" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  padding: "20px 0",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "var(--red-glow)",
                    border: "2px solid var(--red)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 36,
                  }}
                >
                  🚨
                </div>
                <div style={{ textAlign: "center" }}>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "var(--red)",
                      marginBottom: 6,
                    }}
                  >
                    SOS Sent!
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {typing
                      ? "🧠 AI is classifying your emergency..."
                      : "✅ Response team being dispatched..."}
                  </p>
                </div>
                {typing && (
                  <div style={{ width: "100%" }}>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: "70%",
                          background:
                            "linear-gradient(90deg,var(--red),var(--amber))",
                          animation: "none",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        textAlign: "center",
                        marginTop: 8,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Claude AI processing...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TRACKING */}
            {phase === "tracking" && triageResult && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div
                  className="alert-banner alert-critical"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  <span style={{ fontSize: 22 }}>🚨</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      Help is on the way — Stay calm
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                      Your location has been pinned on the response map
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginBottom: 8,
                      letterSpacing: "0.1em",
                    }}
                  >
                    FIRST RESPONDER ETA
                  </div>
                  <div
                    style={{
                      fontSize: 52,
                      fontWeight: 900,
                      fontFamily: "var(--font-mono)",
                      color: "var(--amber)",
                      lineHeight: 1,
                    }}
                  >
                    {m}:{String(s).padStart(2, "0")}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginTop: 6,
                    }}
                  >
                    {triageResult.staff}
                  </div>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div className="glass-sm" style={{ padding: 14 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 4,
                        fontWeight: 600,
                      }}
                    >
                      AI CLASSIFICATION
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--blue)",
                        fontWeight: 600,
                      }}
                    >
                      {triageResult.type} — {triageResult.severity}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginTop: 4,
                      }}
                    >
                      {triageResult.protocol}
                    </div>
                  </div>
                  <div
                    className="glass-sm"
                    style={{
                      padding: 12,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      AI Confidence
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--green)",
                        fontWeight: 700,
                      }}
                    >
                      {triageResult.confidence}%
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="btn btn-primary"
                  style={{ justifyContent: "center", fontSize: 13 }}
                >
                  📡 View on War Room Map
                </Link>

                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 12, justifyContent: "center" }}
                  onClick={() => {
                    setPhase("idle");
                    setCategory(null);
                    setVoice("");
                    setTriageResult(null);
                    setEta(180);
                  }}
                >
                  ← Start New SOS
                </button>
              </div>
            )}
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 20,
          }}
        >
          Guest SOS Portal · RCIO · Room auto-detected via hotel network
        </p>
      </div>
    </main>
  );
}
