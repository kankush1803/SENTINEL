"use client";
import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { BACKEND_URL } from "../api";

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
});

export default function StaffPage() {
  const [activeIncident, setActiveIncident] = useState(null);
  const [status, setStatus] = useState("STANDBY");
  const [vibrating, setVibrating] = useState(false);

  useEffect(() => {
    const channel = pusher.subscribe("sentinel-channel");
    
    channel.bind("incident-update", (incident) => {
      if (incident.status === "OPEN" || incident.status === "ACTIVE") {
        setActiveIncident(incident);
        setStatus("DISPATCHED");
        setVibrating(true);
        
        // Browser vibration API (if supported)
        if ("vibrate" in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500]);
        }

        setTimeout(() => setVibrating(false), 3000);
      } else if (incident.id === activeIncident?.id && incident.status === "RESOLVED") {
        setActiveIncident(null);
        setStatus("STANDBY");
      }
    });

    return () => {
      pusher.unsubscribe("sentinel-channel");
    };
  }, [activeIncident]);

  const handleResolve = async () => {
    if (!activeIncident) return;
    try {
      await fetch(`${BACKEND_URL}/api/incidents/${activeIncident.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      setActiveIncident(null);
      setStatus("STANDBY");
    } catch (err) {
      console.error("Resolve failed:", err);
    }
  };

  const triage = activeIncident?.metadata ? JSON.parse(activeIncident.metadata) : null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: vibrating ? "var(--red-glow)" : "var(--bg-void)",
        color: "var(--text-primary)",
        padding: 20,
        transition: "background 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800 }}>RESPONDER UNIT</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Officer Siddhant</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={`badge ${status === "STANDBY" ? "badge-blue" : "badge-red"}`}>
            {status}
          </div>
        </div>
      </header>

      {!activeIncident ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: 0.5 }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>📡</div>
          <div style={{ fontWeight: 700 }}>Monitoring Radio...</div>
          <div style={{ fontSize: 12, marginTop: 8 }}>Standing by for dispatch</div>
        </div>
      ) : (
        <div className="fade-in-up" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass" style={{ borderLeft: "4px solid var(--red)", padding: 20 }}>
            <div style={{ color: "var(--red)", fontWeight: 800, fontSize: 12, marginBottom: 10 }}>NEW DISPATCH</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{activeIncident.type}</h1>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--amber)" }}>{activeIncident.location}</div>
          </div>

          {triage && (
            <div className="glass" style={{ padding: 20 }}>
              <div style={{ color: "var(--blue)", fontWeight: 800, fontSize: 11, marginBottom: 12, letterSpacing: "0.1em" }}>AI PROTOCOL GUIDANCE</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{triage.summary}</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {triage.response_protocol?.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13, background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: 8 }}>
                    <span style={{ color: "var(--blue)", fontWeight: 800 }}>0{i+1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <button 
               className="btn btn-primary" 
               style={{ width: "100%", padding: "20px", fontSize: 18, fontWeight: 800 }}
               onClick={handleResolve}
            >
              Mark as Resolved
            </button>
            <button className="btn btn-ghost" style={{ width: "100%", opacity: 0.7 }}>
              Request Backup
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }
        .badge-blue { background: var(--blue-glow); color: var(--blue); border: 1px solid var(--blue); }
        .badge-red { background: var(--red-glow); color: var(--red); border: 1px solid var(--red); }
        .glass { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; backdrop-filter: blur(10px); }
        .btn { border: none; border-radius: 12px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-primary { background: var(--red); color: white; }
        .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.5s ease-out; }
      `}</style>
    </main>
  );
}
