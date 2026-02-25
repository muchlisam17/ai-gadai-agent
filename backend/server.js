const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Inisialisasi Database di memori (akan hilang kalau server mati, cocok untuk test)
const db = new sqlite3.Database(':memory:'); 

db.serialize(() => {
    db.run(`CREATE TABLE reporting (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_user TEXT,
        jenis_barang TEXT,
        pertanyaan TEXT,
        estimasi_nilai TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Endpoint untuk menerima data dari n8n
app.post('/api/log-gadai', (req, res) => {
    const { nama_user, jenis_barang, pertanyaan, estimasi_nilai } = req.body;
    const stmt = db.prepare("INSERT INTO reporting (nama_user, jenis_barang, pertanyaan, estimasi_nilai) VALUES (?, ?, ?, ?)");
    stmt.run(nama_user, jenis_barang, pertanyaan, estimasi_nilai);
    stmt.finalize();
    res.json({ message: "Data berhasil masuk ke dashboard!" });
});

// Endpoint untuk mengambil data ke tampilan
app.get('/api/data', (req, res) => {
    db.all("SELECT * FROM reporting ORDER BY timestamp DESC", [], (err, rows) => {
        res.json(rows);
    });
});

// Menampilkan halaman dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});