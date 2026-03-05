import React from 'react';

function HBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={s.row}>
      <span style={s.barLabel}>{label}</span>
      <div style={s.barTrack}>
        <div style={{ ...s.barFill, width: `${pct}%`, background: color }} />
        <span style={s.barVal}>{value}</span>
      </div>
      <span style={s.barCount}>{value}</span>
    </div>
  );
}

export default function DistribusiChart({ stats }) {
  if (!stats) return null;

  const byJenis   = stats.by_jenis   || [];
  const byWilayah = stats.by_wilayah || [];

  const emasCount  = parseInt(byJenis.find(j => j.jenis_barang === 'emas')?.count       || 0);
  const elekCount  = parseInt(byJenis.find(j => j.jenis_barang === 'elektronik')?.count || 0);
  const maxJenis   = Math.max(emasCount, elekCount, 1);

  const maxWilayah = Math.max(...byWilayah.map(w => parseInt(w.count)), 1);

  return (
    <div style={s.grid}>
      {/* Jenis Barang */}
      <div style={s.card}>
        <div style={s.cardTitle}>
          <span>Jenis Barang</span>
          <span style={s.cardSub}>distribusi</span>
        </div>
        <div style={s.bars}>
          <HBar label="Emas"       value={emasCount} max={maxJenis}   color="#C9A84C" />
          <HBar label="Elektronik" value={elekCount} max={maxJenis}   color="#4C8EC9" />
        </div>
      </div>

      {/* Wilayah */}
      <div style={s.card}>
        <div style={s.cardTitle}>
          <span>Wilayah</span>
          <span style={s.cardSub}>distribusi</span>
        </div>
        <div style={s.bars}>
          {byWilayah.length > 0
            ? byWilayah.map(w => (
                <HBar
                  key={w.wilayah}
                  label={w.wilayah || 'Lainnya'}
                  value={parseInt(w.count)}
                  max={maxWilayah}
                  color="#888880"
                />
              ))
            : <p style={{ color: '#888880', fontSize: 13 }}>Belum ada data wilayah</p>
          }
        </div>
      </div>
    </div>
  );
}

const s = {
  grid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  card:      { background: '#111111', border: '1px solid #2A2A2A', borderRadius: 12, padding: '1.5rem' },
  cardTitle: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24, fontSize: '1rem', fontWeight: 700, fontFamily: "'Syne', sans-serif" },
  cardSub:   { fontSize: '0.75rem', color: '#888880', fontWeight: 400 },
  bars:      { display: 'flex', flexDirection: 'column', gap: 16 },
  row:       { display: 'flex', alignItems: 'center', gap: 12 },
  barLabel:  { width: 80, fontSize: '0.8rem', color: '#888880', flexShrink: 0 },
  barTrack:  { flex: 1, background: '#1A1A1A', borderRadius: 4, height: 28, position: 'relative', overflow: 'hidden' },
  barFill:   { height: '100%', borderRadius: 4, transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', paddingLeft: 8 },
  barVal:    { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontFamily: "'DM Mono', monospace", color: '#0A0A0A', fontWeight: 600 },
  barCount:  { width: 24, textAlign: 'right', fontSize: '0.85rem', color: '#888880', fontFamily: "'DM Mono', monospace", flexShrink: 0 },
};
