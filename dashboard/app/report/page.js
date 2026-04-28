'use client';
import { useState } from 'react';
import Link from 'next/link';

const INCIDENTS = [
  {
    id:'INC-2026-1047', type:'Medical Emergency', severity:'CRITICAL', status:'CLOSED',
    location:'Room 1204, Floor 12', zone:'North Wing',
    opened:'2026-04-28 21:18:04', closed:'2026-04-28 21:43:17',
    duration:'25 min 13 sec', aiTime:'1.8s', firstResponse:'2 min 47 sec',
    assignedStaff:['Dr. Priya Rao','Nurse Kim Lee','Tom Lee (Escort)'],
    aiClass:'Cardiac Event — 94% confidence', protocol:'P1 — Immediate Medical',
    outcome:'Guest stabilised. Transported to City General Hospital.',
    timeline:[
      { t:'21:18:04', e:'Guest SOS received — Room 1204' },
      { t:'21:18:06', e:'AI classification: Medical Emergency (P1) — 1.8s' },
      { t:'21:18:07', e:'Staff Dr. Rao & Nurse Kim dispatched via push alert' },
      { t:'21:18:10', e:'SMS confirmations sent to 3 staff' },
      { t:'21:18:15', e:'First responder ETA locked: 2 min 47 sec' },
      { t:'21:21:02', e:'Dr. Rao arrived at Room 1204 — AED deployed' },
      { t:'21:25:30', e:'Guest stabilised — ambulance called' },
      { t:'21:43:17', e:'Incident closed — guest transported to hospital' },
    ],
  },
  {
    id:'INC-2026-1046', type:'Security Threat', severity:'HIGH', status:'ACTIVE',
    location:'B2 Parking Zone C', zone:'Basement',
    opened:'2026-04-28 21:14:31', closed:'—',
    duration:'Ongoing', aiTime:'2.1s', firstResponse:'4 min 12 sec',
    assignedStaff:['Raj Kumar (Security)','Ali Hassan (CCTV)'],
    aiClass:'Unauthorised Access Pattern — 81% confidence', protocol:'P2 — Security Response',
    outcome:'Ongoing. Suspect located. Law enforcement notified.',
    timeline:[
      { t:'21:14:31', e:'Camera anomaly detected — B2 Zone C' },
      { t:'21:14:33', e:'AI classified: Suspicious Activity (P2) — 2.1s' },
      { t:'21:14:34', e:'Security Alpha & Beta dispatched' },
      { t:'21:18:43', e:'Raj Kumar arrived at B2 Zone C' },
      { t:'21:19:00', e:'CCTV live review initiated — Ali Hassan' },
    ],
  },
  {
    id:'INC-2026-1045', type:'Fire Alarm', severity:'CRITICAL', status:'CLOSED',
    location:'Ballroom East, Floor 3', zone:'Event Level',
    opened:'2026-04-28 20:58:00', closed:'2026-04-28 21:04:22',
    duration:'6 min 22 sec', aiTime:'1.4s', firstResponse:'1 min 50 sec',
    assignedStaff:['Fire Unit 2','Sara Patel (Safety)'],
    aiClass:'Smoke Detected — 97% confidence', protocol:'P1 — Evacuation + Fire',
    outcome:'False alarm. Catering smoke. Suppressed. Area cleared.',
    timeline:[
      { t:'20:58:00', e:'Fire alarm triggered — Ballroom East' },
      { t:'20:58:01', e:'AI classified: Fire/Smoke (P1) — 1.4s' },
      { t:'20:58:02', e:'Evacuation protocol initiated for Floor 3' },
      { t:'20:59:50', e:'Fire Unit 2 on scene — smoke from catering' },
      { t:'21:04:22', e:'All-clear given. Incident closed.' },
    ],
  },
];

function ReportCard({ inc, expanded, onToggle }) {
  const sev = inc.severity === 'CRITICAL' ? 'badge-red' : inc.severity === 'HIGH' ? 'badge-amber' : 'badge-blue';
  const statc = inc.status === 'CLOSED' ? 'badge-green' : 'badge-red';
  return (
    <div className="glass" style={{ marginBottom:16, overflow:'hidden' }}>
      <div style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:16, cursor:'pointer' }} onClick={onToggle}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:15 }}>{inc.id}</span>
            <span className={`badge ${sev}`}>{inc.severity}</span>
            <span className={`badge ${statc}`}>{inc.status}</span>
          </div>
          <div style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:4 }}>{inc.type} · {inc.location}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
            Opened: {inc.opened} · Duration: {inc.duration}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
          <div style={{ fontSize:11, color:'var(--text-muted)' }}>AI Triage</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:16, fontWeight:700, color:'var(--green)' }}>{inc.aiTime}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>First Response: {inc.firstResponse}</div>
        </div>
        <span style={{ color:'var(--text-muted)', fontSize:18, marginLeft:8 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding:'0 22px 22px', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'var(--text-muted)', marginBottom:10, letterSpacing:'0.06em' }}>INCIDENT DETAILS</div>
              <div className="glass-sm" style={{ padding:14, display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  ['AI Classification', inc.aiClass],
                  ['Protocol Triggered', inc.protocol],
                  ['Zone', inc.zone],
                  ['Outcome', inc.outcome],
                ].map(([k,v])=>(
                  <div key={k}>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{k}</div>
                    <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:2 }}>{v}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Assigned Staff</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:4 }}>
                    {inc.assignedStaff.map(s=>(
                      <span key={s} className="badge badge-blue" style={{ fontSize:10 }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'var(--text-muted)', marginBottom:10, letterSpacing:'0.06em' }}>RESPONSE TIMELINE</div>
              <div className="timeline">
                {inc.timeline.map((e,i)=>(
                  <div key={i} className="tl-item">
                    <div className="tl-line">
                      <div className="tl-dot" style={{ background: i===0?'var(--red)':i===inc.timeline.length-1?'var(--green)':'var(--blue)' }}/>
                      {i<inc.timeline.length-1&&<div className="tl-connector"/>}
                    </div>
                    <div className="tl-content">
                      <div className="tl-time">{e.t}</div>
                      <div className="tl-text">{e.e}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  const [expanded, setExpanded] = useState('INC-2026-1047');
  const [downloading, setDownloading] = useState(null);

  function download(id) {
    setDownloading(id);
    setTimeout(() => setDownloading(null), 2000);
  }

  function downloadAll() {
    setDownloading('ALL');
    const lines = INCIDENTS.map(inc => [
      `Incident Report — ${inc.id}`,
      `Type: ${inc.type}`,
      `Severity: ${inc.severity}`,
      `Status: ${inc.status}`,
      `Location: ${inc.location}`,
      `Opened: ${inc.opened}`,
      `Closed: ${inc.closed}`,
      `Duration: ${inc.duration}`,
      `AI Triage Time: ${inc.aiTime}`,
      `First Response: ${inc.firstResponse}`,
      `AI Classification: ${inc.aiClass}`,
      `Protocol: ${inc.protocol}`,
      `Staff: ${inc.assignedStaff.join(', ')}`,
      `Outcome: ${inc.outcome}`,
      '',
      'TIMELINE:',
      ...inc.timeline.map(e => `  ${e.t} — ${e.e}`),
      '',
      '─'.repeat(60),
      '',
    ].join('\n')).join('\n');

    const header = [
      'RCIO — Rapid Crisis Intelligence Operations',
      'Incident Compliance Report',
      `Generated: ${new Date().toLocaleString()}`,
      `Total Incidents: ${INCIDENTS.length}`,
      '═'.repeat(60),
      '',
    ].join('\n');

    const blob = new Blob([header + lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'RCIO_Incident_Report.txt'; a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(null), 2000);
  }

  return (
    <main style={{ paddingTop:64, minHeight:'100vh', background:'var(--bg-void)' }} className="grid-bg">
      <div className="container" style={{ paddingTop:24, paddingBottom:48 }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>📋 Incident Reports</h1>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>Auto-generated compliance reports with full audit trail and response timeline</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Link href="/dashboard" className="btn btn-ghost" style={{ fontSize:13 }}>🖥️ War Room</Link>
            <button className="btn btn-primary" style={{ fontSize:13 }} onClick={downloadAll}>
              {downloading==='ALL' ? '✅ Downloading...' : '⬇️ Download All Reports'}
            </button>
          </div>
        </div>

        {/* summary stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }}>
          {[
            { label:'Total Incidents', val:INCIDENTS.length, color:'var(--blue)' },
            { label:'Resolved', val:INCIDENTS.filter(i=>i.status==='CLOSED').length, color:'var(--green)' },
            { label:'Active', val:INCIDENTS.filter(i=>i.status==='ACTIVE').length, color:'var(--red)' },
            { label:'Avg AI Triage', val:'1.77s', color:'var(--amber)' },
          ].map((s,i)=>(
            <div key={i} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color:s.color, fontSize:32 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* compliance header */}
        <div className="glass" style={{ padding:'16px 22px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', gap:20 }}>
            <span style={{ fontSize:13, color:'var(--text-secondary)' }}>🏨 Grand Meridian Hotel, Mumbai</span>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>Shift: Night · 20:00–06:00</span>
            <span style={{ fontSize:13, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>2026-04-28</span>
          </div>
          <span className="badge badge-blue">COMPLIANCE READY</span>
        </div>

        {/* incident reports */}
        {INCIDENTS.map(inc => (
          <div key={inc.id}>
            <ReportCard
              inc={inc}
              expanded={expanded===inc.id}
              onToggle={()=>setExpanded(expanded===inc.id?null:inc.id)}
            />
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:-10, marginBottom:20 }}>
              <button className="btn btn-ghost" style={{ fontSize:12 }} onClick={()=>download(inc.id)}>
                {downloading===inc.id ? '✅ Downloading...' : `⬇️ Download ${inc.id}`}
              </button>
            </div>
          </div>
        ))}

        {/* regulatory note */}
        <div className="glass" style={{ padding:20, borderColor:'rgba(255,209,102,0.2)' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'var(--gold)', marginBottom:10 }}>⚖️ Regulatory Compliance Note</div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.65 }}>
            All incident reports are auto-generated by RCIO and include immutable timestamps, AI classification audit trail, staff dispatch logs, and response time metrics. Reports comply with hospitality emergency documentation standards and can be submitted to local authorities, insurance providers, or internal safety committees.
          </p>
        </div>
      </div>
    </main>
  );
}
