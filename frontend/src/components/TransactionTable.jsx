import React from 'react';

const fmtRp = (n) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0);

// ← FIX TIMEZONE: tambah timeZone Asia/Jakarta
const fmtTime = (dt) => new Date(dt).toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

const BADGE = {
  emas:       { bg: 'rgba(201,168,76,0.15)',  color: '#C9A84C', label: '⚡ Emas' },
  elektronik: { bg: 'rgba(76,142,201,0.15)',  color: '#4C8EC9', label: '📱 Elektronik' },
};

export default function TransactionTable({ transactions, loading, onDelete, onRefresh }) {
  if (loading) return <div style={s.msg}>Memuat data…</div>;

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.title}>Riwayat Transaksi</span>
        <button style={s.refreshBtn} onClick={onRefresh}>↻ Refresh</button>
      </div>

      {transactions.length === 0
        ? <div style={s.msg}>Belum ada transaksi tercatat</div>
        : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['#','NAMA USER','JENIS','BARANG','WILAYAH','ESTIMASI NILAI','WAKTU',''].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const badge = BADGE[tx.jenis_barang] || { bg: '#222', color: '#888', label: tx.jenis_barang };
                  const barang = tx.nama_barang || (tx.gramasi ? `${tx.gramasi} gram` : '—');
                  return (
                    <tr key={tx.id} style={{ ...s.tr, background: i % 2 === 0 ? '#111111' : '#151515' }}>
                      <td style={s.td}>{tx.id}</td>
                      <td style={{ ...s.td, fontWeight: 700 }}>{tx.nama_user}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={s.td}>{barang}</td>
                      <td style={s.td}>{tx.wilayah || '—'}</td>
                      <td style={{ ...s.td, color: '#C9A84C', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                        {fmtRp(tx.estimasi_nilai)}
                      </td>
                      <td style={{ ...s.td, color: '#888880', fontSize: 12 }}>
                        {fmtTime(tx.created_at)}
                      </td>
                      <td style={s.td}>
                        <button style={s.del} onClick={() => onDelete(tx.id)}>×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

const s = {
  card:       { background: '#111111', border: '1px solid #2A2A2A', borderRadius: 12, padding: '1.5rem' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:      { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem' },
  refreshBtn: { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#888880', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13 },
  tableWrap:  { overflowX: 'auto' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:         { padding: '10px 14px', textAlign: 'left', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#888880', letterSpacing: '0.06em', borderBottom: '1px solid #2A2A2A' },
  tr:         {},
  td:         { padding: '14px', borderBottom: '1px solid #1A1A1A', color: '#F0EDE8', verticalAlign: 'middle' },
  badge:      { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  del:        { background: 'none', border: 'none', color: '#888880', cursor: 'pointer', fontSize: 18, lineHeight: 1 },
  msg:        { textAlign: 'center', padding: 60, color: '#888880' },
};
