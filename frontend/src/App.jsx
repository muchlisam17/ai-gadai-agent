import React, { useState, useEffect, useCallback } from 'react';
import StatsCards from './components/StatsCards';
import TransactionTable from './components/TransactionTable';
import DistribusiChart from './components/DistribusiChart';

// Backend sama-sama port 3000 (served oleh Express)
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function App() {
  const [stats, setStats]               = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [lastRefresh, setLastRefresh]   = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, tRes] = await Promise.all([
        fetch(`${API}/api/stats`),
        fetch(`${API}/api/transactions`),
      ]);
      const sData = await sRes.json();
      const tData = await tRes.json();
      setStats(sData);
      setTransactions(Array.isArray(tData) ? tData : []);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const t = setInterval(fetchData, 30000);
    return () => clearInterval(t);
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    await fetch(`${API}/api/transaction/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const timeStr = lastRefresh.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <div style={s.root}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoBox}>🏅</div>
          <div>
            <div style={s.logoTitle}>GadaiMulia Dashboard</div>
            <div style={s.logoSub}>PT Mulia Informasi Teknologi</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <span style={s.liveDot} />
          <span style={s.badge}>Update: {timeStr}</span>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={s.main}>
        <StatsCards stats={stats} loading={loading} />
        <DistribusiChart stats={stats} />
        <TransactionTable
          transactions={transactions}
          loading={loading}
          onDelete={handleDelete}
          onRefresh={fetchData}
        />
      </main>
    </div>
  );
}

const s = {
  root:       { minHeight: '100vh', background: '#0A0A0A', color: '#F0EDE8', fontFamily: "'DM Sans', sans-serif" },
  header:     { background: '#111111', borderBottom: '1px solid #2A2A2A', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 100 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  logoBox:    { width: 36, height: 36, background: '#C9A84C', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  logoTitle:  { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' },
  logoSub:    { fontSize: '0.7rem', color: '#888880', fontFamily: "'DM Mono', monospace" },
  headerRight:{ display: 'flex', alignItems: 'center', gap: '0.75rem' },
  liveDot:    { width: 8, height: 8, background: '#4CAF84', borderRadius: '50%' },
  badge:      { background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 100, padding: '4px 12px', fontSize: '0.75rem', fontFamily: "'DM Mono', monospace", color: '#888880' },
  main:       { maxWidth: 1400, margin: '0 auto', padding: '2rem' },
};
