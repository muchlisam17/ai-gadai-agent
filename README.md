# AI Customer Service - Gadai Emas & Elektronik
**PT Mulia Informasi Teknologi — AI Engineer Test**

> Dibuat oleh: **Muchlis Aryomukti**

---

## Bot Telegram

- **Bot:** @GadaiMuliaBot
- **Bot ID:** `8751824911`
- **Link:** https://t.me/GadaiMuliaBot

---

## Arsitektur Sistem

```
Telegram User
     │
     ▼
Telegram Bot (@GadaiMuliaBot)
     │
     ▼
n8n Workflow Orchestrator
     │
     ├──► AI Agent (GPT-3.5-turbo / OpenAI)
     │         │
     │         ├──► Tool: get_gold_price
     │         │         └── metals.live API (real-time, fallback hardcode)
     │         │
     │         ├──► Tool: Qdrant Retriever (RAG)
     │         │         └── Embeddings: bge-m3:567m (Ollama, 100% GPU)
     │         │             └── Vector DB: Qdrant (446 vectors, 1024 dim)
     │         │
     │         └──► Tool: save_to_dashboard
     │                   └── Dashboard Backend (Node.js + Express + PostgreSQL)
     │
     └──► Simple Memory (per user session by Telegram ID)

Dashboard Backend : http://localhost:3000
Dashboard Frontend: http://localhost:3001
```

---

## Flow AI Agent

### Gadai Emas
1. Bot tanya nama user
2. User pilih "emas"
3. Bot tanya gramasi
4. Bot panggil `get_gold_price` → metals.live API → konversi IDR/gram
5. Hitung: `Estimasi = harga_per_gram × gramasi`
6. User konfirmasi → bot simpan ke dashboard via `save_to_dashboard`

### Gadai Elektronik
1. Bot tanya nama user
2. User pilih "elektronik"
3. Bot tampilkan contoh list barang tersedia
4. User pilih barang, bot tanya wilayah
5. Bot panggil Qdrant Retriever (RAG) dengan query nama barang saja
6. Jika tidak ditemukan → "Maaf, harga barang tidak ditemukan."
7. Jika ditemukan, hitung berdasarkan wilayah:
   - DKI Jakarta: harga × 80%
   - Jawa Barat: harga × 70%
   - Jawa Timur: harga × 60%
   - Lainnya: harga × 50%
8. User konfirmasi → bot simpan ke dashboard

---

## Cara Setup & Menjalankan

### Prasyarat
- Docker Desktop (RAM minimal 6GB untuk WSL2)
- Node.js ≥ 18
- ngrok
- PowerShell (Windows)

### Langkah 1 — Clone Repository
```bash
git clone https://github.com/muchlisam17/ai-gadai-agent.git
cd ai-gadai-agent
```

### Langkah 2 — Jalankan Docker (n8n + Qdrant + Ollama + PostgreSQL + Backend)
```bash
# Tanpa GPU
docker compose up -d --build

# Dengan GPU (NVIDIA)
docker compose -f docker-compose-gpu.yml up -d --build
```

Tunggu semua container siap:
- `n8n`              → http://localhost:5678
- `qdrant`           → http://localhost:6333
- `ollama`           → http://localhost:11434
- `postgres`         → localhost:5432
- `gadai-dashboard`  → http://localhost:3000

Cek backend berjalan:
```
http://localhost:3000/health  →  {"status":"ok"}
```

### Langkah 3 — Jalankan Frontend React
```bash
cd frontend
npm install
npm start
```

Dashboard terbuka di: http://localhost:3001

### Langkah 4 — Setup Ollama (pertama kali)
```bash
docker exec ollama ollama pull bge-m3:567m
```

### Langkah 5 — Restore Qdrant Snapshot
1. Buka http://localhost:6333/dashboard
2. Klik **Collections** → **Upload Snapshot**
3. Upload file `rag_data_2026.snapshot`
4. Collection name: `rag_data_2026`

### Langkah 6 — Setup ngrok
```powershell
ngrok http 5678
```
Catat URL ngrok (contoh: https://xxxx.ngrok-free.app)

### Langkah 7 — Import Workflow n8n
1. Buka http://localhost:5678
2. Import `workflow_gadai_complete.json`
3. Set credentials:
   - Telegram Bot Token: (isi dengan token bot Anda)
   - OpenAI API Key: (isi dengan key Anda)
   - Ollama URL: http://ollama:11434
   - Qdrant URL: http://qdrant:6333
4. Publish workflow

### Langkah 8 — Set Telegram Webhook
Setelah ngrok jalan, webhook sudah otomatis terset via n8n Telegram Trigger node.
Pastikan workflow sudah di-Publish dan ngrok aktif.

### Langkah 9 — Verifikasi Database PostgreSQL
```bash
docker exec postgres psql -U gadai_user -d gadai_db -c "SELECT * FROM transactions;"
```

### Langkah 10 — Akses Dashboard
Buka http://localhost:3001

---

## Contoh Skenario Percakapan

### Skenario 1 — Gadai Emas
```
User:  Halo
Bot:   Halo! Selamat datang di layanan gadai PT Mulia Informasi Teknologi.
       Boleh saya tahu nama Anda?
User:  Muchlis
Bot:   Apakah Anda ingin menggadaikan emas atau elektronik, Muchlis?
User:  Emas
Bot:   Berapa gram emas yang ingin Anda gadaikan?
User:  10 gram
Bot:   Estimasi harga gadai emas 10 gram adalah Rp 16.900.000.
       Apakah Anda ingin melanjutkan?
User:  Iya
Bot:   Baik, estimasi harga telah disimpan.
       Apakah ada barang lain yang ingin Anda gadaikan? (emas/elektronik)
User:  Tidak
Bot:   Baik, sampai jumpa Muchlis! Semoga transaksi Anda berjalan lancar.
```

### Skenario 2 — Gadai Elektronik (Ditemukan)
```
User:  Elektronik
Bot:   Berikut contoh barang elektronik yang tersedia:
       - Nintendo Switch OLED
       - Samsung Galaxy Z Flip 1
       - Samsung Galaxy Z Flip 4
       - Samsung Galaxy M13
       Silakan sebutkan nama lengkap barang yang ingin Anda gadaikan.
User:  Samsung Galaxy Z Flip 1
Bot:   Anda berada di wilayah mana?
       1. Jawa Barat (Jabar)
       2. DKI Jakarta
       3. Jawa Timur (Jatim)
       4. Lainnya
User:  1
Bot:   Estimasi harga gadai Samsung Galaxy Z Flip 1 di wilayah
       Jawa Barat adalah Rp 2.420.208. Apakah Anda ingin melanjutkan?
User:  Iya
Bot:   Baik, estimasi harga telah disimpan.
```

### Skenario 3 — Gadai Elektronik (Tidak Ditemukan)
```
User:  iPhone 17
Bot:   Maaf, harga barang tidak ditemukan di database kami.
       Apakah ingin mencoba barang lain dari list di atas?
```

### Skenario 4 — User Menolak Memberikan Nama
```
User:  Halo
Bot:   Halo! Selamat datang di layanan gadai PT Mulia Informasi Teknologi.
       Boleh saya tahu nama Anda?
User:  Tidak mau
Bot:   Maaf, saya tidak bisa membantu tanpa informasi nama.
       Jika Anda ingin memulai layanan gadai, silakan berikan nama Anda.
```

---

## Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Workflow Orchestrator | n8n (self-hosted) |
| LLM | GPT-3.5-turbo (OpenAI) |
| Embeddings | bge-m3:567m (Ollama, GPU) |
| Vector DB | Qdrant |
| Channel | Telegram |
| Backend (BE) | JavaScript — Node.js + Express |
| Frontend (FE) | React 18 (JSX + Recharts) |
| Database (DB) | PostgreSQL 15 (via Docker) |
| Infrastructure | Docker Compose |

---

## API Dashboard

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /health | Cek status server |
| POST | /api/transaction | Simpan transaksi baru |
| GET | /api/transactions | Ambil semua transaksi |
| GET | /api/stats | Statistik ringkasan |
| DELETE | /api/transaction/:id | Hapus transaksi |

---

## Struktur File

```
ai-gadai-agent/
├── docker-compose.yml              # Docker setup (semua service)
├── docker-compose-gpu.yml          # Docker setup dengan GPU Ollama
├── README.md                       # Dokumentasi ini
├── workflow_gadai_complete.json    # n8n workflow
├── rag_data_2026.snapshot          # Qdrant snapshot data (446 items)
├── backend/                        # BE — Node.js + Express
│   ├── Dockerfile
│   ├── package.json
│   └── server.js                   # Entry point + PostgreSQL
└── frontend/                       # FE — React
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.jsx                 # Root component + data fetching
        └── components/
            ├── StatsCards.jsx      # Kartu ringkasan (total, emas, elektronik, nilai)
            ├── DistribusiChart.jsx # Bar chart distribusi jenis & wilayah
            └── TransactionTable.jsx # Tabel riwayat transaksi
```
