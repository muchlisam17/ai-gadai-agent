const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database setup
const db = new Database('/data/gadai.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_user TEXT NOT NULL,
    jenis_barang TEXT NOT NULL,
    pertanyaan_user TEXT,
    nama_barang TEXT,
    estimasi_nilai INTEGER NOT NULL,
    wilayah TEXT,
    gramasi REAL,
    channel TEXT DEFAULT 'Telegram',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// POST /api/transaction - simpan transaksi
app.post('/api/transaction', (req, res) => {
  const {
    nama_user,
    jenis_barang,
    pertanyaan_user,
    nama_barang,
    estimasi_nilai,
    wilayah,
    gramasi,
    channel
  } = req.body;

  if (!nama_user || !jenis_barang || !estimasi_nilai) {
    return res.status(400).json({ error: 'nama_user, jenis_barang, estimasi_nilai wajib diisi' });
  }

  const stmt = db.prepare(`
    INSERT INTO transactions (nama_user, jenis_barang, pertanyaan_user, nama_barang, estimasi_nilai, wilayah, gramasi, channel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    nama_user,
    jenis_barang,
    pertanyaan_user || '',
    nama_barang || '',
    estimasi_nilai,
    wilayah || '',
    gramasi || null,
    channel || 'Telegram'
  );

  res.json({ success: true, id: result.lastInsertRowid });
});

// GET /api/transactions - ambil semua transaksi
app.get('/api/transactions', (req, res) => {
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC').all();
  res.json(transactions);
});

// GET /api/stats - statistik
app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  const totalNilai = db.prepare('SELECT SUM(estimasi_nilai) as total FROM transactions').get();
  const byJenis = db.prepare('SELECT jenis_barang, COUNT(*) as count FROM transactions GROUP BY jenis_barang').all();
  const byWilayah = db.prepare("SELECT wilayah, COUNT(*) as count FROM transactions WHERE wilayah != '' GROUP BY wilayah").all();

  res.json({
    total_transaksi: total.count,
    total_nilai: totalNilai.total || 0,
    by_jenis: byJenis,
    by_wilayah: byWilayah
  });
});

// DELETE /api/transaction/:id - hapus transaksi
app.delete('/api/transaction/:id', (req, res) => {
  db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard backend running on port ${PORT}`);
});
