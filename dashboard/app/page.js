'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const TICKER = [
  '🔴  CRITICAL — Room 1204: Medical Emergency — AI Classified in 1.8s',
  '🟡  WARNING  — Level B2 Parking: Suspicious Activity Detected',
  '🔵  INFO     — Staff unit #7 dispatched — ETA 3 min 22 sec',
  '🟢  RESOLVED — Pool Area: Minor Injury — Incident #0041 Closed',
  '🔴  CRITICAL — Ballroom East: Fire Alarm Triggered — Responders Enroute',
];

const STATS = [
  { label: 'Active Incidents', value: '2', sub: '↑ 1 in last 15 min', color: 'var(--red)' },
  { label: 'Avg AI Triage Time', value: '1.9s', sub: 'Claude classification', color: 'var(--blue)' },
  { label: 'Staff On Alert', value: '14', sub: '3 floors covered', color: 'var(--amber)' },
  { label: 'Fastest ETA', value: '2:47', sub: 'First responder enroute', color: 'var(--green)' },
];

const FEATURES = [
  { icon: '🧠', title: 'AI Triage Engine', desc: 'Claude AI classifies every SOS in under 2 seconds — assigning severity, type, and optimal response protocol.', color: 'var(--blue)' },
  { icon: '🗺️', title: 'Live Floor Intelligence', desc: 'Interactive floor maps with glowing incident pins, heat overlays, and staff position tracking in real time.', color: 'var(--amber)' },
  { icon: '📡', title: 'Instant Staff Dispatch', desc: 'Automated task routing to nearest staff via AR headsets, SMS, and push — with acknowledgement tracking.', color: 'var(--gold)' },
  { icon: '🚨', title: 'Guest SOS Portal', desc: 'One-tap SOS with voice-to-text, room auto-detection, and silent panic mode for sensitive situations.', color: 'var(--red)' },
  { icon: '⏱️', title: 'Responder ETA Sync', desc: 'Live countdowns for first responders with highlighted floor plan navigation and rendezvous coordination.', color: 'var(--green)' },
  { icon: '📋', title: 'Auto Compliance Reports', desc: 'One-click downloadable incident reports with full audit trail and regulatory compliance formatting.', color: 'var(--blue)' },
];

const STEPS = [
  { step:'01', icon:'📱', title:'Guest Presses SOS', desc:'Room 1204 — Guest reports chest pain. Voice description auto-transcribed.', color:'var(--red)' },
  { step:'02', icon:'🧠', title:'AI Classifies in 1.8s', desc:'Claude: MEDICAL EMERGENCY — Cardiac. Severity: CRITICAL. Protocol: P1.', color:'var(--blue)' },
  { step:'03', icon:'📳', title:'Staff Phones Buzz', desc:'Nearest 3 staff receive push + SMS with room, floor plan, AED location.', color:'var(--amber)' },
  { step:'04', icon:'🗺️', title:'Map Pin Turns Red', desc:'Floor 12 pin activates on war room display. Zone alert bleeds red live.', color:'var(--red)' },
  { step:'05', icon:'🚑', title:'Responder Gets Route', desc:'First responder gets highlighted floor plan to Room 1204. ETA: 2:47.', color:'var(--green)' },
  { step:'06', icon:'📋', title:'Incident Closes + Report', desc:'Guest stabilised. Incident #0047 closed. Compliance PDF auto-generates.', color:'var(--gold)' },
];

export default function HomePage() {
  const [tickerIdx, setTickerIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <main style={{ paddingTop: 64 }}>
      {/* ticker */}
      <div style={{ background:'rgba(255,59,92,0.08)', borderBottom:'1px solid rgba(255,59,92,0.2)', padding:'8px 28px', display:'flex', alignItems:'center', gap:14, fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-secondary)' }}>
        <span style={{ color:'var(--red)', fontWeight:700, letterSpacing:'0.08em', flexShrink:0 }}>LIVE FEED</span>
        <span>{TICKER[tickerIdx]}</span>
      </div>

      {/* hero */}
      <section style={{ position:'relative', minHeight:'90vh', display:'flex', alignItems:'center', overflow:'hidden' }} className="grid-bg">
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(/hero.png)', backgroundSize:'cover', backgroundPosition:'center top', filter:'brightness(0.28) saturate(1.2)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(2,4,8,0.2) 0%, rgba(2,4,8,0.85) 80%, var(--bg-void) 100%)' }} />
        <div className="container" style={{ position:'relative', zIndex:2 }}>
          <div style={{ maxWidth:760, opacity: loaded?1:0, transition:'opacity 0.8s ease' }}>
            <div className="badge badge-red" style={{ marginBottom:20 }}>
              <span className="pulse-dot pulse-red" style={{ width:8, height:8 }} />
              Hackathon — Vision Hack 2Solve · Rapid Crisis Response Track
            </div>
            <h1 style={{ fontSize:'clamp(36px,6vw,72px)', fontWeight:900, lineHeight:1.08, marginBottom:24 }}>
              <span className="holo-text">Rapid Crisis</span><br />
              <span style={{ color:'var(--text-primary)' }}>Intelligence Operations</span>
            </h1>
            <p style={{ fontSize:18, color:'var(--text-secondary)', lineHeight:1.7, marginBottom:36, maxWidth:580 }}>
              The AI-powered command center bridging guests, hotel staff, and first responders in real time — eliminating data silos that cost lives during emergencies.
            </p>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              <Link href="/dashboard" className="btn btn-primary" style={{ fontSize:15, padding:'13px 28px' }}>⚡ Enter War Room</Link>
              <Link href="/sos" className="btn btn-danger" style={{ fontSize:15, padding:'13px 28px' }}>🆘 Guest SOS Demo</Link>
              <Link href="/triage" className="btn btn-ghost" style={{ fontSize:15, padding:'13px 28px' }}>🧠 AI Triage Panel</Link>
            </div>
          </div>
        </div>
        <div style={{ position:'absolute', right:'5%', top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:12, zIndex:2 }}>
          {STATS.map((s,i) => (
            <div key={i} className="glass-sm fade-in-up" style={{ padding:'14px 18px', minWidth:180, animationDelay:`${i*0.15}s`, borderLeft:`3px solid ${s.color}` }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize:26, color:s.color }}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 60-second story */}
      <section className="section" style={{ background:'var(--bg-deep)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ fontSize:36, fontWeight:800, marginBottom:12 }}>60-Second Demo Story</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:16 }}>A full emergency loop — SOS to closed incident — in one minute flat.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:0 }}>
            {STEPS.map((s,i) => (
              <div key={i} style={{ padding:'28px 24px', borderTop:'1px solid var(--border)', borderRight:(i%3!==2)?'1px solid var(--border)':'none', position:'relative' }}>
                <div style={{ position:'absolute', top:20, right:20, fontSize:11, fontWeight:700, color:'var(--text-muted)', fontFamily:'var(--font-mono)', letterSpacing:'0.1em' }}>STEP {s.step}</div>
                <div style={{ fontSize:32, marginBottom:12 }}>{s.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8, color:s.color }}>{s.title}</h3>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* features */}
      <section className="section grid-bg">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ fontSize:36, fontWeight:800, marginBottom:12 }}>System Capabilities</h2>
            <p style={{ color:'var(--text-secondary)' }}>Every layer of the crisis response stack, integrated.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
            {FEATURES.map((f,i) => (
              <div key={i} className="glass" style={{ padding:28, transition:'transform 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ fontSize:32, marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10, color:f.color }}>{f.title}</h3>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign:'center' }}>
          <h2 style={{ fontSize:40, fontWeight:900, marginBottom:16 }}>Ready for the <span className="glow-blue">War Room?</span></h2>
          <p style={{ color:'var(--text-secondary)', fontSize:16, marginBottom:36 }}>Live incidents · AI triage · Staff coordination · Compliance reports</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ fontSize:16, padding:'14px 32px' }}>🖥️ Launch Dashboard</Link>
            <Link href="/sos" className="btn btn-danger" style={{ fontSize:16, padding:'14px 32px' }}>🆘 Simulate SOS</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop:'1px solid var(--border)', padding:'24px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', color:'var(--text-muted)', fontSize:13 }}>
        <span>RCIO — Rapid Crisis Intelligence Operations · Vision Hack 2Solve 2026</span>
        <span style={{ fontFamily:'var(--font-mono)' }}>v1.0.0-demo</span>
      </footer>
    </main>
  );
}
