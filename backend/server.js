const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// PostgreSQL connection
const db = new Pool({
  host:     process.env.DB_HOST     || 'postgres',
  user:     process.env.DB_USER     || 'gadai_user',
  password: process.env.DB_PASSWORD || 'gadai_pass123',
  database: process.env.DB_NAME     || 'gadai_db',
  port:     parseInt(process.env.DB_PORT || '5432'),
});

// Buat tabel otomatis saat pertama kali jalan
db.query(`
  CREATE TABLE IF NOT EXISTS transactions (
    id          SERIAL PRIMARY KEY,
    nama_user   TEXT NOT NULL,
    jenis_barang TEXT NOT NULL,
    pertanyaan_user TEXT,
    nama_barang TEXT,
    estimasi_nilai BIGINT NOT NULL,
    wilayah     TEXT,
    gramasi     NUMERIC(10,2),
    channel     TEXT DEFAULT 'Telegram',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )
`).then(() => {
  console.log('✅ Tabel transactions siap');
}).catch(err => {
  console.error('❌ Gagal buat tabel:', err.message);
});

// POST /api/transaction - simpan transaksi (dipanggil n8n)
app.post('/api/transaction', async (req, res) => {
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

  try {
    const result = await db.query(
      `INSERT INTO transactions
         (nama_user, jenis_barang, pertanyaan_user, nama_barang, estimasi_nilai, wilayah, gramasi, channel)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        nama_user,
        jenis_barang,
        pertanyaan_user || '',
        nama_barang     || '',
        estimasi_nilai,
        wilayah         || '',
        gramasi         || null,
        channel         || 'Telegram'
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});

// GET /api/transactions - ambil semua transaksi
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats - statistik untuk dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const total     = await db.query('SELECT COUNT(*) as count FROM transactions');
    const totalNilai = await db.query('SELECT COALESCE(SUM(estimasi_nilai),0) as total FROM transactions');
    const byJenis   = await db.query('SELECT jenis_barang, COUNT(*) as count FROM transactions GROUP BY jenis_barang');
    const byWilayah = await db.query("SELECT wilayah, COUNT(*) as count FROM transactions WHERE wilayah != '' GROUP BY wilayah");

    res.json({
      total_transaksi: parseInt(total.rows[0].count),
      total_nilai:     parseInt(totalNilai.rows[0].total),
      by_jenis:        byJenis.rows,
      by_wilayah:      byWilayah.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transaction/:id - hapus transaksi
app.delete('/api/transaction/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard backend running on port ${PORT}`);
});
