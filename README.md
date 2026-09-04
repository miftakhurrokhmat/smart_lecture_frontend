# Smart Lecture — Platform Perkuliahan Inklusif Berbasis Kecerdasan Buatan

Smart Lecture adalah platform sistem informasi perkuliahan cerdas dan inklusif yang dirancang untuk mendukung interaksi belajar-mengajar antara dosen dan mahasiswa melalui pemanfaatan kecerdasan buatan (Artificial Intelligence). Platform ini mendukung transkripsi suara real-time (Speech-to-Text), sintesis suara neural (Text-to-Speech), peringkasan materi otomatis (Summarization), ekstraksi peta konsep hierarkis (Mindmap), manajemen jadwal dan pengingat berbasis kelas, serta forum diskusi terstruktur.

Platform ini mengusung sistem multi-peran (3 roles): Administrator, Dosen, dan Mahasiswa dengan hak akses dan visualisasi data yang disesuaikan secara dinamis.

---

## Daftar Isi
1. Deskripsi & Fitur Utama
2. Arsitektur & Tech Stack
3. Struktur Direktori Proyek
4. Prasyarat Sistem
5. Panduan Instalasi & Setup
6. Menjalankan Aplikasi
7. Akun Demo Bawaan
8. Ringkasan Endpoint API
9. Panduan Troubleshooting

---

## 1. Deskripsi & Fitur Utama

### A. Fitur Perkuliahan & AI
- Transkripsi Suara Real-Time (Speech-to-Text): Menggunakan model Faster-Whisper Small teroptimasi CPU (int8) dengan dukungan CTranslate2, Silero VAD, dan filter pasca-pemrosesan istilah akademik untuk transkripsi live dosen.
- Text-to-Speech (TTS) Neural: Menggunakan Microsoft Edge Neural Voices (id-ID-GadisNeural dan id-ID-ArdiNeural) dengan kamus normalisasi istilah asing/teknis (contoh: backend, API, cache, queue, JSON, SQL) agar pelafalan bahasa Indonesia terdengar alami.
- Ringkasan Materi Perkuliahan Otomatis: Pendekatan hybrid menggunakan TextRank TF-IDF dengan fallback cerdas ke Google Gemini Flash Lite API untuk menghasilkan intisari perkuliahan, poin-poin kunci, dan kata kunci topik.
- Mindmap Konsep Hierarkis: Ekstraksi struktur konsep perkuliahan menjadi visualisasi diagram cabang bertingkat interaktif.

### B. Fitur Manajemen & Interaksi
- Sistem Tiga Role (Admin, Dosen, Mahasiswa):
  - Admin: Manajemen data dosen, data mahasiswa, program studi, kelas, dan mata kuliah.
  - Dosen: Manajemen jadwal sesi perkuliahan, kontrol sesi live, transkripsi, materi file, pengelolaan pengingat kelas, dan pemantauan interaksi mahasiswa.
  - Mahasiswa: Dashboard personal berbasis kelas yang menampilkan sesi hari ini, riwayat sesi selesai, sesi mendatang, checklist pengingat kelas, forum diskusi, dan TTS interaktif.
- Pengingat (Reminders) Berbasis Kelas:
  - Dosen memiliki hak akses penuh (CRUD: Create, Read, Update, Delete) dan dapat memilih target kelas (misal: TI-3A, TI-3B, atau Semua Kelas).
  - Mahasiswa hanya menerima pengingat yang ditujukan untuk kelasnya dan hanya memiliki hak akses checklist (selesai/belum selesai) secara mandiri.
- Forum Diskusi Perkuliahan:
  - Mahasiswa dapat mengajukan diskusi dengan memilih mata kuliah dan topik sesi yang sesuai dengan kelasnya.
  - Dosen dan sesama mahasiswa dapat saling membalas tanggapan secara terstruktur.
- Manajemen Jadwal & Laporan:
  - Tab Jadwal (sesi hari ini), History (sesi yang sudah selesai di hari ini atau sebelumnya), dan Upcoming Event (sesi di tanggal berikutnya).
  - Filter otomatis: Beranda dosen hanya menampilkan sesi yang diampu dosen tersebut, sedangkan beranda mahasiswa menampilkan seluruh sesi mata kuliah terkait kelasnya.

---

## 2. Arsitektur & Tech Stack

### Frontend Client
- Framework: React 18
- Bahasa: TypeScript
- Bundler & Dev Server: Vite 8
- Routing: React Router DOM v6
- Desain Antarmuka: Tailwind CSS, Radix UI Primitives, Lucide Icons
- Visualisasi Data: Recharts
- Komunikasi Real-time: Socket.IO Client

### Backend Web & Database Server
- Runtime: Node.js (LTS)
- Framework Server: Express 5
- Database ORM: Drizzle ORM
- Database Engine: PostgreSQL
- File Upload: Multer
- Komunikasi Real-time: Socket.IO Server

### Backend AI Service (Folder /apiai)
- Framework: FastAPI (Python 3.11)
- ASGI Server: Uvicorn
- Speech-to-Text: Faster-Whisper (Model small, CPU int8, Silero VAD)
- Text-to-Speech: Edge-TTS (Microsoft Neural Voice API)
- Natural Language Processing: Sastrawi, Scikit-Learn (TF-IDF, Cosine Similarity), NetworkX (PageRank)
- Model Bahasa Besar (LLM Hybrid): Google Gemini Flash Lite REST API

---

## 3. Struktur Direktori Proyek

```
smart_lecture_frontend/
|-- apiai/                      # Layanan backend Python untuk STT, TTS, dan NLP
|   |-- main.py                 # Endpoint FastAPI: /api/stt, /api/tts, /api/summarize, /api/mindmap
|   |-- requirements.txt        # Dependensi Python AI
|   |-- venv/                   # Virtual environment Python (diabaikan oleh git)
|   |-- .env                    # Variabel environment AI (diabaikan oleh git)
|   |-- .env.example            # Template variabel environment AI
|   |-- .gitignore              # Konfigurasi ignore lokal apiai
|   `-- README.md               # Dokumentasi modul AI
|-- client/                     # Source code antarmuka pengguna (React)
|   |-- components/             # Komponen UI modular (TtsCard, PengingatSection, Layout, dll)
|   |-- contexts/               # Context React (AuthContext)
|   |-- hooks/                  # Custom React hooks
|   |-- lib/                    # Helper utility, konfigurasi, dan mock data
|   |-- pages/                  # Halaman aplikasi:
|   |   |-- admin/              # Halaman manajemen Admin (Dashboard, Dosen, Mahasiswa, Kelas, Matkul)
|   |   |-- dosen/              # Halaman Dosen (Dashboard, Jadwal, Sesi Detail, Diskusi, Laporan)
|   |   |-- Dashboard.tsx       # Dashboard utama Mahasiswa
|   |   |-- Index.tsx           # Redirector role & Landing page
|   |   |-- Login.tsx           # Halaman otentikasi login
|   |   |-- Register.tsx        # Halaman pendaftaran mahasiswa
|   |   |-- MahasiswaDiskusi.tsx # Forum diskusi mahasiswa
|   |   `-- MahasiswaSesiDetail.tsx # Ruang sesi perkuliahan mahasiswa
|   |-- App.tsx                 # Routing utama dan role guards
|   |-- global.css              # Styling global Tailwind
|   `-- main.tsx                # Entry point React DOM
|-- drizzle/                    # Definisi skema database PostgreSQL
|   `-- schema.ts               # Tabel users, courses, sessions, reminders, classes, dll
|-- public/                     # Aset statis publik (gambar, background cover, ilustrasi)
|-- server/                     # Backend Express server
|   |-- routes/                 # Rute REST API Express (auth, courses, dosen, admin, reminders, dll)
|   |-- db.ts                   # Inisialisasi koneksi Drizzle ke PostgreSQL
|   `-- index.ts                # Entry point server Express & WebSocket
|-- uploads/                    # Direktori penyimpanan file unggahan materi (PDF/dokumen)
|-- .env                        # Variabel environment utama (diabaikan oleh git)
|-- .env.example                # Template variabel environment utama
|-- .gitignore                  # Konfigurasi Git Ignore repositori
|-- drizzle.config.ts           # Konfigurasi Drizzle Kit
|-- package.json                # Metadata proyek dan daftar dependensi Node.js
|-- tsconfig.json               # Konfigurasi TypeScript
|-- vite.config.ts              # Konfigurasi Vite Client
`-- vite.config.server.ts       # Konfigurasi build Vite SSR Server
```

---

## 4. Prasyarat Sistem

Sebelum melakukan instalasi, pastikan perangkat Anda telah terpasang:
- Node.js versi 18.x atau lebih baru (disarankan Node.js 20 LTS)
- Package Manager: pnpm (disarankan) atau npm
- Python versi 3.10 atau 3.11
- PostgreSQL Database versi 14 atau lebih baru
- Akses internet aktif (diperlukan untuk dependensi model Edge TTS dan Gemini API)

---

## 5. Panduan Instalasi & Setup

### Langkah 1: Kloning Repositori
Kloning repositori proyek dan masuk ke direktori kerja:
```bash
git clone https://github.com/miftakhurrokhmat/smart_lecture_frontend.git
cd smart_lecture_frontend
```

### Langkah 2: Konfigurasi Environment Variables
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan sesuaikan nilainya:
```env
VITE_PUBLIC_BUILDER_KEY=__BUILDER_PUBLIC_KEY__
PING_MESSAGE="ping pong"
DATABASE_URL="postgres://smartlecture:smartlecture@localhost:5432/smartlecture"
GEMINI_API_KEY=masukkan_api_key_gemini_anda_di_sini
```

Lakukan hal yang sama untuk direktori `apiai`:
```bash
cp apiai/.env.example apiai/.env
```
Buka file `apiai/.env`:
```env
GEMINI_API_KEY=masukkan_api_key_gemini_anda_di_sini
```

### Langkah 3: Instalasi Dependensi Node.js
Instal seluruh paket dependensi web server dan frontend:
```bash
pnpm install
# atau menggunakan npm:
npm install
```

### Langkah 4: Setup Database PostgreSQL, Migrasi & Seeder
Pastikan layanan PostgreSQL berjalan di komputer Anda, lalu buat database:
```sql
CREATE DATABASE smartlecture;
CREATE USER smartlecture WITH PASSWORD 'smartlecture';
GRANT ALL PRIVILEGES ON DATABASE smartlecture TO smartlecture;
```

Jalankan generate skema database Drizzle, migrasi tabel, serta seeding data awal:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```
*Catatan: Perintah `npm run db:seed` mengeksekusi file `server/seed.ts`. Seeder juga dipanggil secara otomatis saat web server pertama kali dijalankan apabila database masih kosong.*

### Langkah 5: Setup Virtual Environment Python (AI Service)
Masuk ke folder `apiai`, buat virtual environment, dan pasang dependensi:
```bash
cd apiai
python3 -m venv venv

# Aktivasi virtual environment (macOS/Linux):
source venv/bin/activate

# Atau aktivasi di Windows:
# venv\Scripts\activate

# Instalasi library Python:
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

---

## 6. Menjalankan Aplikasi

Aplikasi terdiri dari dua layanan utama yang berjalan secara berdampingan:

### 1. Menjalankan Layanan Python AI Service (Port 8000)
Buka terminal pertama:
```bash
cd apiai
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Layanan AI akan aktif pada: `http://localhost:8000`

### 2. Menjalankan Web Server & Frontend (Port 8080)
Buka terminal kedua di root direktori repositori:
```bash
npm run dev
# atau pnpm dev
```
Aplikasi web akan aktif pada: `http://localhost:8080`

### 3. Membangun untuk Lingkungan Produksi (Production Build)
Untuk melakukan kompilasi build produksi:
```bash
npm run build
npm start
```

---

## 7. Akun Demo Bawaan & Data Awal (Seed Data)

Saat database diinisialisasi pertama kali atau melalui perintah `npm run db:seed`, sistem menyediakan data awal untuk keperluan pengujian dan demonstrasi:

### Daftar Akun Default

| Peran | Email | Password | Identitas / Keterangan |
|---|---|---|---|
| Admin | admin@smartlecture.com | admin123 | Administrator Sistem (Akses Manajemen Master Data) |
| Dosen | dosen@smartlecture.com | dosen123 | Dr. Santoso Makmur (NIDN: 0011223344) |
| Mahasiswa | mahasiswa@smartlecture.com | mhs123 | Budi Mahasiswa (NIM: 123456789 - Kelas TI-3A) |
| Mahasiswa | siti@student.smartlecture.com | mhs123 | Siti Rahma (NIM: 123456790 - Kelas TI-3B) |

### Master Data yang Di-generate Otomatis
- **Kelas:** `TI-3A` (Teknik Informatika Semester 3 Kelas A) dan `TI-3B` (Teknik Informatika Semester 3 Kelas B).
- **Relasi Mahasiswa:** Budi Mahasiswa terdaftar pada kelas `TI-3A`, sedangkan Siti Rahma pada kelas `TI-3B`.
- **Mata Kuliah:**
  - Pemrograman Web (Kode: `TI-PW`, Dosen Pengampu: Dr. Santoso Makmur)
  - Basis Data Lanjut (Kode: `TI-BDL`, Dosen Pengampu: Dr. Santoso Makmur)
- **Sesi Perkuliahan:** Sesi live ("Pengenalan Arsitektur React") dan sesi terjadwal untuk kelas `TI-3A`.
- **Pengingat:** Pengingat otomatis dengan target kelas `TI-3A`, `TI-3B`, dan `Semua Kelas`.

---

## 8. Ringkasan Endpoint API

### Otentikasi & Pengguna
- POST `/api/auth/login`: Masuk ke sistem dan mendapatkan token & objek user.
- POST `/api/auth/register`: Pendaftaran akun mahasiswa baru.
- POST `/api/auth/logout`: Keluar dari sesi.
- GET `/api/user/profile`: Mengambil profil pengguna.
- PUT `/api/user/profile`: Memperbarui profil pengguna.

### Perkuliahan & Sesi
- GET `/api/dashboard?userId={id}&role={role}`: Mengambil data sesi beranda (difilter per kelas untuk mahasiswa, dan per dosen untuk dosen).
- GET `/api/dosen/sessions`: Mengambil seluruh sesi yang diampu dosen.
- POST `/api/dosen/sessions`: Membuat sesi perkuliahan baru.
- PATCH `/api/dosen/sessions/:id`: Memperbarui status sesi (scheduled, live, completed).
- GET `/api/dosen/sessions/:id`: Detail sesi perkuliahan dosen.
- POST `/api/dosen/sessions/:id/end`: Mengakhiri sesi live dan memicu ringkasan AI.

### Pengingat (Reminders)
- GET `/api/reminders?userId={id}&role={role}`: Mengambil daftar pengingat sesuai hak akses kelas.
- POST `/api/reminders`: Membuat pengingat baru dengan target kelas (khusus dosen).
- PUT `/api/reminders/:id`: Memperbarui pengingat (khusus dosen).
- DELETE `/api/reminders/:id`: Menghapus pengingat (khusus dosen).

### Layanan Kecerdasan Buatan (AI Engine)
- POST `/api/tts`: Menghasilkan audio MP3 neural berbasis teks dengan normalisasi istilah asing otomatis.
- POST `/api/stt`: Transkripsi audio file menjadi teks akademik menggunakan Faster-Whisper.
- POST `/api/summarize`: Menghasilkan ringkasan terstruktur materi perkuliahan.
- POST `/api/mindmap`: Mengekstrak struktur hierarkis JSON untuk visualisasi peta pikiran.

---

## 9. Panduan Troubleshooting

### Masalah 1: Gagal Terhubung ke Database (DrizzleQueryError / EPERM)
- Gejala: Muncul pesan error koneksi database saat menjalankan server.
- Solusi:
  1. Pastikan service PostgreSQL aktif di komputer lokal Anda (`brew services start postgresql` atau cek PostgreSQL Windows Service).
  2. Periksa kembali kecocokan `DATABASE_URL` pada file `.env`.
  3. Pastikan database `smartlecture` sudah dibuat di PostgreSQL.

### Masalah 2: Layanan TTS Gagal Sintesis atau Suara Tidak Muncul
- Gejala: Indikator loading terus berputar atau muncul pesan gagal sintesis audio.
- Solusi:
  1. Pastikan service Python FastAPI berjalan pada `http://localhost:8000`.
  2. Edge-TTS membutuhkan koneksi internet untuk terhubung ke endpoint neural Microsoft Azure (`speech.platform.bing.com`). Pastikan koneksi internet stabil.
  3. Periksa terminal Uvicorn untuk melihat log kesalahan komunikasi socket.

### Masalah 3: Bentrok Port (Port Already in Use)
- Gejala: Port 8080 atau Port 8000 tidak dapat dibuka karena sudah dipakai proses lain.
- Solusi:
  - Periksa proses yang menggunakan port:
    ```bash
    lsof -i :8080
    lsof -i :8000
    ```
  - Matikan proses lama:
    ```bash
    kill -9 <PID>
    ```

### Masalah 4: Faster-Whisper Lambat atau Error Pustaka CTranslate2
- Gejala: Error saat mengimpor Faster-Whisper atau transkripsi memakan waktu terlalu lama.
- Solusi:
  1. Pastikan Anda menggunakan Python versi 64-bit (Python 3.10 atau 3.11).
  2. Pengaturan pada `main.py` menggunakan `device="cpu"` dan `compute_type="int8"`. Jika perangkat Anda mendukung GPU NVIDIA CUDA, Anda dapat mengubahnya ke `device="cuda"` dan `compute_type="float16"` untuk inferensi yang jauh lebih cepat.
  3. Pastikan compiler C++ / OpenMP tersedia di sistem jika menggunakan OS Linux.

### Masalah 5: File Unggahan Materi Tidak Bisa Dibuka
- Gejala: Error 404 saat mengakses file PDF yang diunggah dosen.
- Solusi:
  1. Pastikan folder `uploads` ada di direktori root repositori.
  2. Pastikan permission folder mengizinkan operasi read/write.
  3. Server Express menyajikan file unggahan secara statis melalui rute `app.use("/uploads", express.static(...))`.

---

## 10. Lisensi & Kontribusi

Proyek Smart Lecture dikembangkan untuk tujuan akademik dan peningkatan aksesibilitas pembelajaran tinggi. Silakan gunakan template `.env.example` dan patuhi aturan perlindungan kredensial sebelum mempublikasikan modifikasi kode ke repositori umum.