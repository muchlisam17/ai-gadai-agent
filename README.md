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
     │         │         └── goldprice.org API (real-time)
     │         │
     │         ├──► Tool: Qdrant Retriever (RAG)
     │         │         └── Embeddings: bge-m3:567m (Ollama)
     │         │             └── Vector DB: Qdrant (446 vectors)
     │         │
     │         └──► Tool: save_to_dashboard
     │                   └── Dashboard Backend (Node.js + SQLite)
     │
     └──► Simple Memory (per user session by Telegram ID)

Dashboard: http://localhost:3000
```

---

## Flow AI Agent

### Gadai Emas
1. Bot tanya nama user
2. User pilih "emas"
3. Bot tanya gramasi
4. Bot panggil `get_gold_price` → goldprice.org API → konversi IDR/gram
5. Hitung: `Estimasi = harga_per_gram × gramasi`
6. User konfirmasi → bot simpan ke dashboard via `save_to_dashboard`

### Gadai Elektronik
1. Bot tanya nama user
2. User pilih "elektronik"
3. Bot tampilkan list barang tersedia
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
- Docker Desktop
- ngrok
- PowerShell (Windows)

### Langkah 1 — Clone Repository
```bash
git clone <repo-url>
cd ai-gadai-agent
```

### Langkah 2 — Jalankan Docker
```bash
docker compose up -d --build
```

Tunggu semua container siap:
- `n8n` → http://localhost:5678
- `qdrant` → http://localhost:6333
- `ollama` → http://localhost:11434
- `gadai-dashboard` → http://localhost:3000

### Langkah 3 — Setup Ollama (pertama kali)
```bash
docker exec ollama ollama pull bge-m3:567m
```

### Langkah 4 — Restore Qdrant Snapshot
1. Buka http://localhost:6333/dashboard
2. Klik **Collections** → **Upload Snapshot**
3. Upload file `rag_data_2026.snapshot`
4. Collection name: `rag_data`

### Langkah 5 — Setup ngrok
```powershell
ngrok http 5678
```
Catat URL ngrok (contoh: https://xxxx.ngrok-free.app)

### Langkah 6 — Import Workflow n8n
1. Buka http://localhost:5678
2. Import `workflow_gadai_complete.json`
3. Set credentials:
   - Telegram Bot Token: `8751824911:AAHpzpmYrfpq2ROMYbdVAyPIhey33_HVa1Y`
   - OpenAI API Key: (isi dengan key Anda)
4. Publish workflow

### Langkah 7 — Set Telegram Webhook
```powershell
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<NGROK_URL>/webhook/<WORKFLOW_ID>/webhook"
```

### Langkah 8 — Akses Dashboard
Buka http://localhost:3000

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
User:  5 gram
Bot:   Estimasi harga gadai emas 5 gram adalah Rp 13.999.830.
       Apakah Anda ingin melanjutkan?
User:  Iya
Bot:   Data Anda telah kami catat. Apakah ada barang lain yang ingin
       Anda gadaikan? (emas/elektronik)
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
User:  Jawa Barat
Bot:   Estimasi harga gadai Samsung Galaxy Z Flip 1 di wilayah
       Jawa Barat adalah Rp 3.457.440. Apakah Anda ingin melanjutkan?
User:  Iya
Bot:   Data Anda telah kami catat.
```

### Skenario 3 — Gadai Elektronik (Tidak Ditemukan)
```
User:  Kamera Canon
Bot:   Maaf, harga barang tidak ditemukan di database kami.
       Apakah ingin mencoba barang lain dari list di atas?
```

---

## Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Workflow Orchestrator | n8n (self-hosted) |
| LLM | GPT-3.5-turbo (OpenAI) |
| Embeddings | bge-m3:567m (Ollama) |
| Vector DB | Qdrant |
| Channel | Telegram |
| Backend | Node.js + Express + SQLite |
| Dashboard | HTML/CSS/JS |
| Infrastructure | Docker Compose |

---

## API Dashboard

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/transaction | Simpan transaksi baru |
| GET | /api/transactions | Ambil semua transaksi |
| GET | /api/stats | Statistik ringkasan |
| DELETE | /api/transaction/:id | Hapus transaksi |

---

## Struktur File

```
ai-gadai-agent/
├── docker-compose.yml          # Docker setup
├── Dockerfile                  # Dashboard container
├── README.md                   # Dokumentasi ini
├── workflow_gadai_complete.json # n8n workflow
├── rag_data_2026.snapshot      # Qdrant snapshot data
├── backend/
│   ├── package.json
│   └── server.js               # Backend API (Node.js)
└── frontend/
    └── index.html              # Dashboard UI
```
