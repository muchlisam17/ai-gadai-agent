import React from 'react';

const fmtRupiah = (n) => {
  if (!n || n === 0) return 'Rp 0';
  if (n >= 1e9)  return `Rp ${(n/1e9).toFixed(1)}M`;
  if (n >= 1e6)  return `Rp ${(n/1e6).toFixed(1)}jt`;
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
};

function Card({ label, value, sub, accent }) {
  return (
    <div style={{ ...s.card, borderTop: `2px solid ${accent}` }}>
      <div style={{ ...s.label, color: '#888880' }}>{label}</div>
      <div style={{ ...s.value, color: accent === '#C9A84C' ? '#C9A84C' : '#F0EDE8' }}>{value}</div>
      <div style={s.sub}>{sub}</div>
    </div>
  );
}

export default function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div style={s.grid}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ ...s.card, background: '#1A1A1A' }} />
        ))}
      </div>
    );
  }

  const total      = stats?.total_transaksi   || 0;
  const totalNilai = stats?.total_nilai        || 0;
  const totalEmas  = (stats?.by_jenis || []).find(j => j.jenis_barang === 'emas')?.count || 0;
  const totalElek  = (stats?.by_jenis || []).find(j => j.jenis_barang === 'elektronik')?.count || 0;

  return (
    <div style={s.grid}>
      <Card label="TOTAL TRANSAKSI"    value={total}               sub="semua channel"  accent="#888880" />
      <Card label="TOTAL ESTIMASI NILAI" value={fmtRupiah(totalNilai)} sub="akumulasi"  accent="#C9A84C" />
      <Card label="GADAI EMAS"         value={totalEmas}            sub="transaksi"      accent="#C9A84C" />
      <Card label="GADAI ELEKTRONIK"   value={totalElek}            sub="transaksi"      accent="#4C8EC9" />
    </div>
  );
}

const s = {
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  card:  { background: '#111111', border: '1px solid #2A2A2A', borderRadius: 12, padding: '1.5rem', minHeight: 110 },
  label: { fontSize: '0.7rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: 12 },
  value: { fontSize: '2rem', fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 6 },
  sub:   { fontSize: '0.75rem', color: '#888880' },
};
