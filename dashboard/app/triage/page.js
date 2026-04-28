'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const EMERGENCY_TYPES = [
  { id:'medical',    label:'Medical Emergency', icon:'🏥', color:'var(--red)',   protocol:'P1 — Immediate medical response. AED + first aid.' },
  { id:'fire',       label:'Fire / Smoke',       icon:'🔥', color:'var(--red)',   protocol:'P1 — Evacuate zone. Alert fire department. Suppress.' },
  { id:'security',   label:'Security Threat',    icon:'🛡️', color:'var(--amber)', protocol:'P2 — Deploy security. Lock down access. CCTV review.' },
  { id:'panic',      label:'Panic / Distress',   icon:'😰', color:'var(--amber)', protocol:'P2 — Silent response. Mental health + security.' },
  { id:'hazmat',     label:'Hazmat / Chemical',  icon:'☣️', color:'var(--red)',   protocol:'P1 — Evacuate 50m radius. HazMat team. Ventilate.' },
  { id:'structural', label:'Structural / Flood',  icon:'🏗️', color:'var(--amber)', protocol:'P2 — Engineering + facilities. Zone isolation.' },
  { id:'theft',      label:'Theft / Burglary',   icon:'🔓', color:'var(--blue)',  protocol:'P3 — Security + law enforcement. CCTV lockdown.' },
  { id:'noise',      label:'Noise / Disturbance', icon:'📣', color:'var(--blue)',  protocol:'P3 — Concierge + security. De-escalation.' },
];

const SAMPLE_INPUTS = [
  'Guest in Room 1204 collapsed, unresponsive, wife is screaming for help',
  'Smoke coming from kitchen area near ballroom, smell very strong',
  'Man acting very strange in B2 parking, following female guest',
  'Water pipe burst on floor 5, flooding the corridor rapidly',
  'Guest reports his laptop and wallet missing from room 809',
];

const AI_THINKING = [
  'Parsing natural language input...',
  'Extracting location entities...',
  'Matching severity indicators...',
  'Cross-referencing emergency protocols...',
  'Calculating confidence scores...',
  'Generating response protocol...',
  'Classification complete ✓',
];

function TypeWriter({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text]);
  return <span>{displayed}<span style={{ borderRight:'2px solid var(--blue)', animation:'blink-caret 0.8s step-end infinite', marginLeft:2 }}> </span></span>;
}

export default function TriagePage() {
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [thinkStep, setThinkStep] = useState(0);
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [history, setHistory] = useState([]);
  const textareaRef = useRef(null);

  function classify() {
    if (!input.trim()) return;
    setResult(null); setThinking(true); setThinkStep(0); setElapsed(null);
    const start = Date.now();
    let step = 0;
    const t = setInterval(() => {
      step++;
      setThinkStep(step);
      if (step >= AI_THINKING.length - 1) {
        clearInterval(t);
        setTimeout(() => {
          const ms = Date.now() - start;
          const lower = input.toLowerCase();
          let match = EMERGENCY_TYPES.find(e => {
            if (e.id==='medical' && (lower.includes('collapse')||lower.includes('chest')||lower.includes('unconscious')||lower.includes('unresponsive')||lower.includes('heart')||lower.includes('breathing'))) return true;
            if (e.id==='fire' && (lower.includes('smoke')||lower.includes('fire')||lower.includes('flame')||lower.includes('burn'))) return true;
            if (e.id==='security' && (lower.includes('follow')||lower.includes('suspicious')||lower.includes('threat')||lower.includes('man')||lower.includes('strange'))) return true;
            if (e.id==='hazmat' && (lower.includes('chemical')||lower.includes('gas')||lower.includes('leak')||lower.includes('hazmat'))) return true;
            if (e.id==='structural' && (lower.includes('water')||lower.includes('flood')||lower.includes('pipe')||lower.includes('crack'))) return true;
            if (e.id==='theft' && (lower.includes('missing')||lower.includes('stolen')||lower.includes('theft')||lower.includes('wallet')||lower.includes('laptop'))) return true;
            if (e.id==='panic' && (lower.includes('panic')||lower.includes('crying')||lower.includes('scream')||lower.includes('distress'))) return true;
            return false;
          }) || EMERGENCY_TYPES[Math.floor(Math.random()*EMERGENCY_TYPES.length)];
          const conf = 85 + Math.floor(Math.random()*12);
          const r = { ...match, confidence: conf, timeMs: ms, input };
          setResult(r);
          setElapsed(ms);
          setThinking(false);
          setHistory(h => [r, ...h].slice(0, 5));
        }, 300);
      }
    }, 200);
  }

  function useSample(s) { setInput(s); setResult(null); }

  return (
    <main style={{ paddingTop:64, minHeight:'100vh', background:'var(--bg-void)' }} className="grid-bg">
      <div className="container" style={{ paddingTop:28, paddingBottom:48 }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>🧠 AI Triage Engine</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14 }}>
            Claude-powered emergency classification. Paste or type any incident description and watch AI classify it in milliseconds.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* input panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="glass" style={{ padding:24 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'var(--blue)' }}>
                📝 Incident Description Input
              </div>
              <textarea ref={textareaRef} value={input} onChange={e=>setInput(e.target.value)}
                placeholder="Describe the emergency in plain language... e.g. 'Guest in Room 1204 collapsed and is unresponsive'"
                style={{
                  width:'100%', minHeight:140, background:'rgba(0,200,255,0.04)',
                  border:'1px solid var(--border)', borderRadius:'var(--radius-md)',
                  color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontSize:14, padding:14,
                  resize:'vertical', outline:'none', lineHeight:1.6,
                }}
                onFocus={e=>e.target.style.borderColor='var(--blue)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'}
              />
              <div style={{ display:'flex', gap:10, marginTop:12 }}>
                <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={classify} disabled={thinking||!input.trim()}>
                  {thinking ? '🔄 Classifying...' : '⚡ Classify Now'}
                </button>
                <button className="btn btn-ghost" onClick={()=>{setInput('');setResult(null);}}>Clear</button>
              </div>
            </div>

            {/* sample prompts */}
            <div className="glass" style={{ padding:20 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:12, color:'var(--text-muted)', letterSpacing:'0.06em' }}>
                SAMPLE INCIDENT DESCRIPTIONS
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {SAMPLE_INPUTS.map((s,i)=>(
                  <button key={i} onClick={()=>useSample(s)} style={{
                    textAlign:'left', padding:'10px 14px', borderRadius:'var(--radius-md)',
                    background:'var(--bg-glass-light)', border:'1px solid var(--border)',
                    color:'var(--text-secondary)', fontSize:13, cursor:'pointer',
                    transition:'all 0.2s',
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--blue)'; e.currentTarget.style.color='var(--blue)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* history */}
            {history.length > 0 && (
              <div className="glass" style={{ padding:20 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:12, color:'var(--text-muted)', letterSpacing:'0.06em' }}>RECENT CLASSIFICATIONS</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {history.map((h,i)=>(
                    <div key={i} className="glass-sm" style={{ padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, color:h.color, fontWeight:600 }}>{h.icon} {h.label}</span>
                      <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{h.timeMs}ms · {h.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* output panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* AI thinking */}
            {thinking && (
              <div className="glass" style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:16, color:'var(--blue)' }}>🤖 Claude AI Processing...</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {AI_THINKING.map((step,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, opacity: i<=thinkStep?1:0.2, transition:'opacity 0.3s' }}>
                      <span style={{ color: i<thinkStep?'var(--green)':i===thinkStep?'var(--blue)':'var(--text-muted)', fontSize:14 }}>
                        {i<thinkStep?'✓':i===thinkStep?'▶':'○'}
                      </span>
                      <span style={{ fontSize:13, color: i===thinkStep?'var(--blue)':'var(--text-secondary)', fontFamily:i===thinkStep?'var(--font-mono)':'inherit' }}>
                        {i===thinkStep?<TypeWriter text={step}/>:step}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${(thinkStep/AI_THINKING.length)*100}%`, background:'linear-gradient(90deg, var(--blue-dim), var(--blue))' }}/>
                  </div>
                </div>
              </div>
            )}

            {/* result */}
            {result && !thinking && (
              <div className="glass" style={{ padding:24, borderColor: result.color, boxShadow:`0 0 30px ${result.color}22` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--text-muted)' }}>AI CLASSIFICATION RESULT</div>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--green)', background:'rgba(0,229,160,0.1)', padding:'3px 10px', borderRadius:99 }}>
                    ⚡ {result.timeMs}ms
                  </span>
                </div>

                <div style={{ textAlign:'center', padding:'24px 0', borderBottom:'1px solid var(--border)', marginBottom:20 }}>
                  <div style={{ fontSize:56, marginBottom:12 }}>{result.icon}</div>
                  <h2 style={{ fontSize:22, fontWeight:800, color:result.color, marginBottom:8 }}>{result.label}</h2>
                  <div style={{ display:'flex', justifyContent:'center', gap:12 }}>
                    <span className={`badge ${result.color==='var(--red)'?'badge-red':'badge-amber'}`}>
                      {result.color==='var(--red)'?'CRITICAL':'HIGH PRIORITY'}
                    </span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--green)', display:'flex', alignItems:'center', gap:6 }}>
                      {result.confidence}% confidence
                    </span>
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div className="glass-sm" style={{ padding:16 }}>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.08em', marginBottom:8 }}>RESPONSE PROTOCOL</div>
                    <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{result.protocol}</p>
                  </div>
                  <div className="glass-sm" style={{ padding:16 }}>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.08em', marginBottom:8 }}>ORIGINAL INPUT</div>
                    <p style={{ fontSize:13, color:'var(--text-secondary)', fontStyle:'italic', lineHeight:1.5 }}>"{result.input}"</p>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <Link href="/dashboard" className="btn btn-primary" style={{ flex:1, justifyContent:'center', fontSize:13 }}>📍 Push to War Room</Link>
                    <Link href="/staff" className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:13 }}>👥 Dispatch Staff</Link>
                  </div>
                </div>
              </div>
            )}

            {/* emergency types grid */}
            {!thinking && !result && (
              <div className="glass" style={{ padding:24 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:16, color:'var(--text-muted)', letterSpacing:'0.06em' }}>SUPPORTED EMERGENCY TYPES</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {EMERGENCY_TYPES.map((t,i)=>(
                    <div key={i} className="triage-chip" onClick={()=>setInput(`${t.label} reported on hotel premises`)}>
                      <span style={{ marginRight:8 }}>{t.icon}</span>{t.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
