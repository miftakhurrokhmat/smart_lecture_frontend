# Voice & Text Processing API (FastAPI)

Layanan backend FastAPI terpadu yang menyediakan 3 fungsi utama: **Speech-to-Text (STT)**, **Text-to-Speech (TTS)**, dan **Peringkas Teks (Text Summarization)**. Seluruh sistem dirancang khusus agar berjalan optimal dan ringan pada lingkungan **CPU murni (tanpa GPU)**.

---

## 📋 Prasyarat Sistem

1. **Python 3.10+**
2. **FFmpeg** (Wajib terdaftar di *environment PATH* untuk membaca dan memproses audio)

---

## 🛠️ Panduan Instalasi

### Opsi 1: Setup di Windows (Local Development)

1. **Pasang FFmpeg**  
   Buka PowerShell sebagai Administrator:
   ```powershell
   winget install Gyan.FFmpeg

   Tutup dan buka kembali PowerShell, pastikan perintah ffmpeg -version berjalan.

2. **Instal Dependensi Python**
   python -m pip install --upgrade pip

   pip install fastapi uvicorn[standard] python-multipart edge-tts faster-whisper scikit-learn networkx numpy Sastrawi

3. **Jalankan Aplikasi**
   uvicorn main:app --reload --port 8000

### Opsi 2: Setup di VPS Server (Ubuntu / Debian)

1. **Update Sistem & Pasang Paket Dasar**
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y python3 python3-pip python3-venv ffmpeg git

2. **Siapkan Direktori & Virtual Environment**
   mkdir ~/ai-api && cd ~/ai-api
   python3 -m venv venv
   source venv/bin/activate

3. **Instal Dependensi Python**
   pip install --upgrade pip
   pip install fastapi uvicorn[standard] python-multipart edge-tts faster-whisper scikit-learn networkx numpy Sastrawi

4. **Jalankan Aplikasi**
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1

5. **(Opsional) Jalankan Sebagai Background Service (Systemd)**
   Buat file service di /etc/systemd/system/fastapi.service:

   [Unit]
   Description=FastAPI Voice and Text Service 
   After=network.target

   [Service]
   User=root
   WorkingDirectory=/root/ai-api
   ExecStart=/root/ai-api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target

   Aktifkan dan jalankan service:
   sudo systemctl daemon-reload
   sudo systemctl enable fastapi
   sudo systemctl start fastapi