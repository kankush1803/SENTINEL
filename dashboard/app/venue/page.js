'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VenuePage() {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/venue/structure')
      .then(res => res.json())
      .then(data => {
        setStructure(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch venue structure:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="grid-bg" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--blue)' }}>Loading Venue Config...</div>;

  return (
    <main style={{ paddingTop:64, minHeight:'100vh', background:'var(--bg-void)' }} className="grid-bg">
      <div className="container" style={{ paddingTop:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:32, fontWeight:800, marginBottom:8 }}>🏢 Venue Configuration</h1>
            <p style={{ color:'var(--text-secondary)' }}>Digital Twin setup for {structure?.name || 'Grand Sentinel Hotel'}</p>
          </div>
          <Link href="/dashboard" className="btn btn-ghost">← Back to War Room</Link>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:24 }}>
          {structure?.floors?.sort((a,b) => b.level - a.level).map(floor => (
            <div key={floor.id} className="glass" style={{ padding:24, borderLeft:`4px solid ${floor.level >= 0 ? 'var(--blue)' : 'var(--amber)'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.05em' }}>FLOOR {floor.level}</div>
                  <div style={{ fontSize:20, fontWeight:700 }}>{floor.name}</div>
                </div>
                <div style={{ background:'var(--bg-glass-light)', padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, color:'var(--text-secondary)' }}>
                  {floor.zones?.length} Zones
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {floor.zones?.map(zone => (
                  <div key={zone.id} className="glass-sm" style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600 }}>{zone.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{zone.description}</div>
                    </div>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 10px var(--green)' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
