import os
import re
import shutil
import tempfile
import asyncio
import json
from collections import defaultdict
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from dotenv import load_dotenv
import numpy as np
import networkx as nx
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.background import BackgroundTasks
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import edge_tts

# ==============================================================================
# INISIALISASI GEMINI API (HYBRID ENGINE)
# ==============================================================================
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL_NAME = "gemini-flash-lite-latest"

async def call_gemini_api(prompt: str, timeout: float = 12.0) -> Optional[str]:
    """Memanggil Gemini REST API secara async dengan graceful fallback jika gagal/offline"""
    if not GEMINI_API_KEY:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2}
    }
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                return text
            else:
                print(f"[Gemini API] Error {res.status_code}: {res.text[:100]}")
                return None
    except Exception as e:
        print(f"[Gemini API] Gagal terhubung (fallback ke lokal): {e}")
        return None

# ==============================================================================
# INISIALISASI KOMPONEN NLP & STATE GLOBAL
# ==============================================================================
# Stopword Sastrawi + Stopword percakapan perkuliahan
stop_factory = StopWordRemoverFactory()
STOPWORDS = set(stop_factory.get_stop_words())
LECTURE_STOPWORDS = {
    'ya', 'nih', 'tuh', 'sih', 'dong', 'deh', 'kan', 'oke', 'baik', 'halo', 'hai',
    'pagi', 'siang', 'sore', 'malam', 'rekan', 'teman', 'mahasiswa', 'sekalian',
    'pertemuan', 'minggu', 'depan', 'kemarin', 'hari', 'ini', 'kali', 'coba',
    'mari', 'silakan', 'tolong', 'mohon', 'terima', 'kasih', 'sampai', 'jumpa',
    'suara', 'dengar', 'jelas', 'layar', 'slide', 'tanya', 'pertanyaan', 'paham',
    'mengerti', 'langsung', 'saja', 'masuk', 'materi', 'kuliah', 'kelas', 'kita',
    'akan', 'adalah', 'yaitu', 'merupakan', 'juga', 'ada', 'bisa', 'harus', 'seperti',
    'beberapa', 'umumnya', 'dilakukan', 'disebut', 'memiliki', 'terdapat', 'berfungsi',
    'sebuah', 'setiap', 'selain', 'agar', 'untuk', 'dari', 'dalam', 'saat', 'hingga'
}
ALL_STOPWORDS = STOPWORDS.union(LECTURE_STOPWORDS)

AUX_STOP_WORDS = {
    'terdiri dari', 'meliputi', 'seperti', 'yaitu', 'adalah', 'bahwa', 'merupakan',
    'dalam', 'pada', 'untuk', 'agar', 'dan', 'atau', 'serta', 'yang', 'sehingga',
    'ada beberapa', 'selain itu', 'oleh karena itu', 'di antaranya', 'tujuan utama'
}

ACADEMIC_THEMES = [
    (r'\b(normalisasi|1nf|2nf|3nf|redundansi|anomali)\b', 'Normalisasi & Penataan Data'),
    (r'\b(primary\s+key|foreign\s+key|kunci\s+utama|kunci\s+tamu)\b', 'Kunci Relasi (Primary & Foreign Key)'),
    (r'\b(relasi|entitas|one\s+to\s+one|one\s+to\s+many|many\s+to\s+many)\b', 'Relasi & Hubungan Antar Entitas'),
    (r'\b(tabel|record|kolom|atribut|baris|field)\b', 'Struktur Tabel & Atribut Data'),
    (r'\b(query|sql|mysql|postgresql|ddl|dml|select|insert)\b', 'Query SQL & Manajemen DBMS'),
    (r'\b(basis\s+data|database|dbms|sistem\s+data)\b', 'Konsep Dasar & Tujuan Basis Data'),
    (r'\b(algoritma|flowchart|pseudocode|logika)\b', 'Algoritma & Logika Pemrograman'),
    (r'\b(fungsi|prosedur|parameter|return|variabel)\b', 'Fungsi & Struktur Kode'),
    (r'\b(object|class|oop|enkapsulasi|inheritance)\b', 'Pemrograman Berorientasi Objek (OOP)'),
    (r'\b(keamanan|enkripsi|autentikasi|otorisasi|firewall)\b', 'Keamanan Sistem & Proteksi Data'),
    (r'\b(jaringan|lan|wan|ip\s+address|tcp|protokol)\b', 'Infrastruktur Jaringan & Protokol'),
    (r'\b(sistem\s+informasi|analisis|kebutuhan|perancangan)\b', 'Analisis & Perancangan Sistem'),
    (r'\b(pemasaran|manajemen|strategi|bisnis|finansial|biaya)\b', 'Manajemen Bisnis & Strategi'),
]

models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    DOKUMENTASI LIFESPAN (ASR / STT MODEL LOADING):
    ------------------------------------------------
    - Model: Faster-Whisper "small"
      * Alasan: Akurasi jauh lebih tinggi dibanding model "base", terutama
        untuk istilah teknis dan materi akademik perkuliahan.
    - Device: "cpu"
    - Kuantisasi (compute_type): "int8"
      * Mengurangi penggunaan RAM hingga ~50% dan mempercepat inferensi
        vektor pada CPU (AVX2/AVX-512) dibanding float32/float16.
    - CPU Threads: Diset 4 (sesuaikan dengan alokasi vCPU VPS Anda).
    """
    print("Memuat model Faster-Whisper small (CPU int8)...")
    models["whisper"] = WhisperModel(
        "small",
        device="cpu",
        compute_type="int8",
        cpu_threads=4
    )
    print("Model Faster-Whisper small siap digunakan!")
    yield
    models.clear()

app = FastAPI(
    title="Voice & Text Processing API",
    description="Layanan backend terintegrasi: STT, TTS, dan Text Summarization dioptimalkan untuk CPU.",
    version="1.0.0",
    lifespan=lifespan
)

# Aktifkan CORS agar frontend (port 8080) dapat mengakses API STT/TTS (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# HELPER UTILITIES & ENHANCER
# ==============================================================================
def split_sentences(text: str):
    """Segmentasi kalimat berbasis regex tanda baca (. ! ?)"""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 0]

def remove_file(path: str):
    """Menghapus file sementara untuk mencegah penumpukan storage"""
    if os.path.exists(path):
        os.remove(path)

# Blacklist halusinasi silence / background noise bawaan Whisper
WHISPER_HALLUCINATIONS = {
    "terima kasih",
    "terima kasih.",
    "terima kasih banyak.",
    "terima kasih sudah menonton.",
    "terima kasih telah menonton.",
    "terima kasih telah menyaksikan.",
    "sampai jumpa.",
    "sampai jumpa lagi.",
    "subtitles by",
    "subtitle by",
    "amara.org",
    "diterjemahkan oleh",
    "watching",
    "you",
    "bye",
    "bye bye",
    "video ini",
}

HALLUCINATION_PATTERNS = [
    re.compile(r"^(terima kasih|sampai jumpa|thanks for watching|thank you)[.!]?$", re.IGNORECASE),
    re.compile(r"^(terima kasih (sudah|telah) (menonton|menyaksikan))[.!]?$", re.IGNORECASE),
    re.compile(r"(subtitles? by|diterjemahkan oleh|amara\.org)", re.IGNORECASE),
]

# Kamus koreksi fonetik & istilah akademik IT / perkuliahan
ACADEMIC_REPLACEMENTS = [
    (re.compile(r"\bpasis\s+data\b", re.IGNORECASE), "basis data"),
    (re.compile(r"\btujan\b", re.IGNORECASE), "tujuan"),
    (re.compile(r"\brerti\b", re.IGNORECASE), "seperti"),
    (re.compile(r"\bartikulas\b", re.IGNORECASE), "artikulasi"),
    (re.compile(r"\b(kueri|kweri)\b", re.IGNORECASE), "query"),
    (re.compile(r"\b(data\s*bes|databes)\b", re.IGNORECASE), "database"),
    (re.compile(r"\b(primari\s*ki|primary\s*ki)\b", re.IGNORECASE), "primary key"),
    (re.compile(r"\b(foren\s*ki|forin\s*ki)\b", re.IGNORECASE), "foreign key"),
    (re.compile(r"\b(softwer|sowftware)\b", re.IGNORECASE), "software"),
    (re.compile(r"\b(hardwer|hardwere)\b", re.IGNORECASE), "hardware"),
    (re.compile(r"\balgoritme\b", re.IGNORECASE), "algoritma"),
    (re.compile(r"\brelasion\b", re.IGNORECASE), "relasional"),
    (re.compile(r"\bprangkat\s+lunak\b", re.IGNORECASE), "perangkat lunak"),
    (re.compile(r"\bprangkat\s+keras\b", re.IGNORECASE), "perangkat keras"),
    (re.compile(r"\bsistem\s+informas\b", re.IGNORECASE), "sistem informasi"),
    (re.compile(r"\b(atribute|attribut)\b", re.IGNORECASE), "atribut"),
    (re.compile(r"\b(normalisas|normalisir)\b", re.IGNORECASE), "normalisasi"),
    (re.compile(r"\brekayasa\s+prangkat\b", re.IGNORECASE), "rekayasa perangkat"),
    (re.compile(r"\b(prosudur)\b", re.IGNORECASE), "prosedur"),
]

def enhance_transcription(raw_text: str) -> str:
    """
    Enhancer transkripsi perkuliahan:
    1. Filter halusinasi audio hening / silence artifacts ('Terima kasih.', subtitle tags, dll)
    2. Perbaiki istilah akademik / IT yang sering salah dikenali
    3. Normalisasi spasi dan kapitalisasi
    """
    if not raw_text:
        return ""
    
    text = raw_text.strip()
    if len(text) <= 2:
        return ""

    # Filter halusinasi keheningan
    cleaned_lower = re.sub(r"[^\w\s]", "", text.lower()).strip()
    if cleaned_lower in WHISPER_HALLUCINATIONS or text.lower() in WHISPER_HALLUCINATIONS:
        return ""
    for pat in HALLUCINATION_PATTERNS:
        if pat.search(text):
            return ""

    # Normalisasi istilah akademik / IT
    for pattern, replacement in ACADEMIC_REPLACEMENTS:
        text = pattern.sub(replacement, text)

    # Format spasi dan tanda baca
    text = re.sub(r"\s+([,.:;?!])", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()

    # Kapitalisasi huruf pertama
    if text:
        text = text[0].upper() + text[1:]

    return text

async def enhance_transcription_hybrid(raw_text: str) -> str:
    """
    Enhance transkripsi dengan pendekatan hybrid:
    1. Filter halusinasi lokal (cepat, 0 latency).
    2. Perbaikan fonetik regex lokal.
    3. Jika GEMINI_API_KEY aktif, minta Gemini Flash Lite membersihkan tata bahasa perkuliahan.
    4. DILARANG menggunakan emote/emoji.
    5. Jika Gemini offline/timeout (3.5s), fallback ke hasil lokal.
    """
    local_enhanced = enhance_transcription(raw_text)
    if not local_enhanced:
        return ""

    if GEMINI_API_KEY and len(local_enhanced) >= 6:
        prompt = (
            "Instruksi: Kamu adalah asisten transkripsi perkuliahan akademik Indonesia formal.\n"
            "Tugas: Koreksi teks transkripsi suara berikut menjadi kalimat perkuliahan yang baku, jelas, dan akurat.\n"
            "Aturan:\n"
            "- Perbaiki istilah teknis/ilmiah atau kata yang typo/salah dengar.\n"
            "- Rapikan tanda baca dan kapitalisasi kalimat.\n"
            "- Jika teks hanya merupakan salam penutup atau keheningan semata, kembalikan string kosong.\n"
            "- DILARANG menggunakan emote atau emoji sama sekali.\n"
            "- Kembalikan HANYA teks hasil perbaikan tanpa awalan, tanpa pengantar, dan tanpa tanda kutip.\n\n"
            f"Teks: {local_enhanced}"
        )
        gemini_res = await call_gemini_api(prompt, timeout=3.5)
        if gemini_res:
            cleaned = gemini_res.strip().strip("\"'`")
            lines = [l.strip().strip("\"'`") for l in cleaned.split("\n") if l.strip()]
            final_text = lines[-1] if lines else cleaned
            final_text = re.sub(r'[^\w\s.,!?:;\-\(\)/]', '', final_text).strip()
            if final_text:
                return final_text

    return local_enhanced


# ==============================================================================
# 1. ENDPOINT: SPEECH-TO-TEXT (STT)
# ==============================================================================
@app.post(
    "/api/stt",
    tags=["Speech Processing"],
    summary="Mengubah audio/suara menjadi teks"
)
async def speech_to_text(file: UploadFile = File(...)):
    """
    CATATAN TEKNIK & PARAMETER STT:
    -------------------------------
    - Engine: Faster-Whisper "small" (CTranslate2 backend).
    - beam_size=3 & best_of=3:
      * Menghasilkan transkripsi kalimat yang jauh lebih akurat dan koheren
        dibanding greedy search (beam_size=1).
    - vad_filter=True (Silero VAD):
      * Memangkas jeda hening / sunyi di awal dan akhir audio.
    - initial_prompt & hotwords:
      * Mengarahkan model ke konteks perkuliahan Bahasa Indonesia dan terminologi IT.
    - Post-processing Hybrid Enhancer:
      * Menyaring halusinasi 'Terima kasih.' dan mengoreksi kata typo fonetik lokal.
      * Menyelaraskan teks dengan Gemini Flash Lite API (jika terhubung).
    """
    whisper: WhisperModel = models.get("whisper")
    if not whisper:
        raise HTTPException(status_code=500, detail="Model STT belum siap.")

    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        shutil.copyfileobj(file.file, temp_audio)
        temp_audio_path = temp_audio.name

    try:
        loop = asyncio.get_running_loop()

        def do_transcribe():
            segments, info = whisper.transcribe(
                temp_audio_path,
                language="id",
                beam_size=3,
                best_of=3,
                temperature=0,
                condition_on_previous_text=False,
                vad_filter=True,
                vad_parameters=dict(
                    min_silence_duration_ms=500,
                    threshold=0.45
                ),
                no_speech_threshold=0.6,
                compression_ratio_threshold=2.4,
                initial_prompt=(
                    "Berikut adalah transkripsi perkuliahan dalam Bahasa Indonesia yang formal, baku, jelas, dan akurat. "
                    "Topik materi perkuliahan mencakup basis data, query, SQL, tabel, entitas, atribut, relasi, normalisasi, "
                    "sistem informasi, algoritma, pemrograman, dan teknologi akademik perguruan tinggi."
                ),
                hotwords="basis data, query, SQL, tabel, entitas, atribut, relasi, normalisasi, primary key, foreign key, sistem informasi"
            )
            raw_text = " ".join(seg.text.strip() for seg in segments if seg.text).strip()
            text = enhance_transcription(raw_text)
            return text, info

        transcription, info = await loop.run_in_executor(None, do_transcribe)
        final_text = await enhance_transcription_hybrid(transcription)

        return {
            "text": final_text,
            "duration": round(info.duration, 2),
            "language": info.language
        }
    finally:
        remove_file(temp_audio_path)


# ==============================================================================
# 2. ENDPOINT: TEXT-TO-SPEECH (TTS) DENGAN NORMALISASI ISTILAH ASING / TEKNIS
# ==============================================================================
# Kamus normalisasi fonetik untuk istilah asing, IT, dan akronim agar pelafalan
# oleh model neural bahasa Indonesia (Gadis / Ardi) terdengar alami dan tepat.
TTS_PRONUNCIATION_DICTIONARY = [
    # Istilah Frasa Majemuk & Multi-kata (Diproses lebih awal)
    (re.compile(r"\brestful\s+api\b", re.IGNORECASE), "Rest-ful Ey-Pi-Ay"),
    (re.compile(r"\brest\s+api\b", re.IGNORECASE), "Rest Ey-Pi-Ay"),
    (re.compile(r"\bui/ux\b", re.IGNORECASE), "Yu-Ay Yu-Eks"),
    (re.compile(r"\bci/cd\b", re.IGNORECASE), "Si-Ay Si-Di"),
    (re.compile(r"\bpull\s+request\b", re.IGNORECASE), "Pul Riquest"),
    (re.compile(r"\bmerge\s+request\b", re.IGNORECASE), "Merj Riquest"),
    (re.compile(r"\bmachine\s+learning\b", re.IGNORECASE), "Mesyin Lerning"),
    (re.compile(r"\bdeep\s+learning\b", re.IGNORECASE), "Dip Lerning"),
    (re.compile(r"\bdata\s+science\b", re.IGNORECASE), "Deita Sayens"),
    (re.compile(r"\bcloud\s+computing\b", re.IGNORECASE), "Klaud Kompyuting"),
    (re.compile(r"\bprimary\s+key\b", re.IGNORECASE), "Praimeri Ki"),
    (re.compile(r"\bforeign\s+key\b", re.IGNORECASE), "Forin Ki"),
    (re.compile(r"\bopen\s+source\b", re.IGNORECASE), "Open Sors"),
    (re.compile(r"\bfront[\s\-]?end\b", re.IGNORECASE), "front-end"),
    (re.compile(r"\bback[\s\-]?end\b", re.IGNORECASE), "bek-end"),
    (re.compile(r"\bfull[\s\-]?stack\b", re.IGNORECASE), "ful-stek"),

    # Akronim Kontekstual (Membedakan istilah IT dengan kata biasa bahasa Indonesia)
    (re.compile(r"\bAPI\b"), "Ey-Pi-Ay"),
    (re.compile(r"\bapi\s+(key|endpoint|gateway|service|route|routes|url)\b", re.IGNORECASE), r"Ey-Pi-Ay \1"),
    (re.compile(r"\b(web|public|open)\s+api\b", re.IGNORECASE), r"\1 Ey-Pi-Ay"),
    (re.compile(r"\bUI\b"), "Yu-Ay"),
    (re.compile(r"\bUX\b"), "Yu-Eks"),
    (re.compile(r"\bAI\b"), "Ey-Ai"),
    (re.compile(r"\bIP\s+address\b", re.IGNORECASE), "Ai-Pi Adres"),
    (re.compile(r"\bIP\b"), "Ai-Pi"),

    # Akronim & Singkatan IT Umum
    (re.compile(r"\bgui\b", re.IGNORECASE), "Ji-Yu-Ay"),
    (re.compile(r"\bcli\b", re.IGNORECASE), "Si-El-Ay"),
    (re.compile(r"\bjson\b", re.IGNORECASE), "Jeyson"),
    (re.compile(r"\bxml\b", re.IGNORECASE), "Eks-Em-El"),
    (re.compile(r"\bsql\b", re.IGNORECASE), "Es-Kyu-El"),
    (re.compile(r"\bnosql\b", re.IGNORECASE), "No-Es-Kyu-El"),
    (re.compile(r"\bmysql\b", re.IGNORECASE), "Mai-Es-Kyu-El"),
    (re.compile(r"\bpostgresql\b", re.IGNORECASE), "Postgres-Kyu-El"),
    (re.compile(r"\bdbms\b", re.IGNORECASE), "Di-Bi-Em-Es"),
    (re.compile(r"\bhtml\b", re.IGNORECASE), "Ech-Ti-Em-El"),
    (re.compile(r"\bcss\b", re.IGNORECASE), "Si-Es-Es"),
    (re.compile(r"\burl\b", re.IGNORECASE), "Yu-Ar-El"),
    (re.compile(r"\bhttps\b", re.IGNORECASE), "Ech-Ti-Ti-Pi-Es"),
    (re.compile(r"\bhttp\b", re.IGNORECASE), "Ech-Ti-Ti-Pi"),
    (re.compile(r"\biot\b", re.IGNORECASE), "Ai-O-Ti"),
    (re.compile(r"\bide\b", re.IGNORECASE), "Ai-Di-I"),
    (re.compile(r"\bsdk\b", re.IGNORECASE), "Es-Di-Kei"),
    (re.compile(r"\boop\b", re.IGNORECASE), "O-O-Pe"),
    (re.compile(r"\bdns\b", re.IGNORECASE), "Di-En-Es"),
    (re.compile(r"\bvpn\b", re.IGNORECASE), "Vi-Pi-En"),
    (re.compile(r"\bllm\b", re.IGNORECASE), "El-El-Em"),
    (re.compile(r"\bnlp\b", re.IGNORECASE), "En-El-Pi"),

    # Bahasa Pemrograman & Ekosistem Populer
    (re.compile(r"\bjavascript\b", re.IGNORECASE), "Java-Skrip"),
    (re.compile(r"\btypescript\b", re.IGNORECASE), "Taip-Skrip"),
    (re.compile(r"\bpython\b", re.IGNORECASE), "Paiton"),
    (re.compile(r"\bnodejs\b|\bnode\.js\b", re.IGNORECASE), "Nod-je-es"),
    (re.compile(r"\breactjs\b|\breact\.js\b|\breact\b", re.IGNORECASE), "Ri-ek"),
    (re.compile(r"\bnextjs\b|\bnext\.js\b", re.IGNORECASE), "Neks-je-es"),
    (re.compile(r"\bvuejs\b|\bvue\.js\b|\bvue\b", re.IGNORECASE), "Vyu"),
    (re.compile(r"\bvite\b", re.IGNORECASE), "Vait"),
    (re.compile(r"\bgithub\b", re.IGNORECASE), "Git-hab"),
    (re.compile(r"\bgitlab\b", re.IGNORECASE), "Git-leb"),
    (re.compile(r"\bdocker\b", re.IGNORECASE), "Doker"),
    (re.compile(r"\bkubernetes\b", re.IGNORECASE), "Kubernetis"),

    # Istilah Teknis yang Rentan Salah Pengucapan Fonetik Asing
    (re.compile(r"\bcaching\b", re.IGNORECASE), "keshing"),
    (re.compile(r"\bcache\b", re.IGNORECASE), "kesh"),
    (re.compile(r"\bqueuing\b", re.IGNORECASE), "kyuing"),
    (re.compile(r"\bqueues\b", re.IGNORECASE), "kyus"),
    (re.compile(r"\bqueue\b", re.IGNORECASE), "kyu"),
    (re.compile(r"\basync\b", re.IGNORECASE), "e-sink"),
    (re.compile(r"\bawait\b", re.IGNORECASE), "e-weit"),
    (re.compile(r"\bdebugging\b", re.IGNORECASE), "de-baging"),
    (re.compile(r"\bdebug\b", re.IGNORECASE), "de-bag"),
    (re.compile(r"\bbugs\b", re.IGNORECASE), "bags"),
    (re.compile(r"\bbug\b", re.IGNORECASE), "bag"),
    (re.compile(r"\bcookies\b", re.IGNORECASE), "kukis"),
    (re.compile(r"\bcookie\b", re.IGNORECASE), "kuki"),
    (re.compile(r"\boauth\b", re.IGNORECASE), "o-ot"),
    (re.compile(r"\bauth\b", re.IGNORECASE), "ot"),
    (re.compile(r"\bmiddleware\b", re.IGNORECASE), "midel-wer"),
    (re.compile(r"\bhardware\b", re.IGNORECASE), "hard-wer"),
    (re.compile(r"\bsoftware\b", re.IGNORECASE), "soft-wer"),
    (re.compile(r"\bframework\b", re.IGNORECASE), "frem-work"),
    (re.compile(r"\bdeployment\b", re.IGNORECASE), "di-ployment"),
    (re.compile(r"\bdeploy\b", re.IGNORECASE), "di-ploy"),
    (re.compile(r"\bdevops\b", re.IGNORECASE), "Dev-Ops"),
    (re.compile(r"\bcloud\b", re.IGNORECASE), "klaud"),
    (re.compile(r"\bengine\b", re.IGNORECASE), "enjin"),
    (re.compile(r"\bthreading\b", re.IGNORECASE), "treding"),
    (re.compile(r"\bthread\b", re.IGNORECASE), "tred"),
    (re.compile(r"\bwebsocket\b", re.IGNORECASE), "web-soket"),
    (re.compile(r"\bsocket\b", re.IGNORECASE), "soket"),
    (re.compile(r"\blibrary\b", re.IGNORECASE), "laibreri"),
    (re.compile(r"\bpackages\b", re.IGNORECASE), "pekejis"),
    (re.compile(r"\bpackage\b", re.IGNORECASE), "pekej"),
    (re.compile(r"\brepository\b", re.IGNORECASE), "repozitori"),
    (re.compile(r"\brepo\b", re.IGNORECASE), "repo"),
    (re.compile(r"\bqueries\b", re.IGNORECASE), "kueris"),
    (re.compile(r"\bquery\b", re.IGNORECASE), "kueri"),
    (re.compile(r"\blogin\b", re.IGNORECASE), "log-in"),
    (re.compile(r"\blogout\b", re.IGNORECASE), "log-aut"),
    (re.compile(r"\bsign\s+in\b", re.IGNORECASE), "sain-in"),
    (re.compile(r"\bsign\s+out\b", re.IGNORECASE), "sain-aut"),
    (re.compile(r"\bupload\b", re.IGNORECASE), "ap-lod"),
    (re.compile(r"\bdownload\b", re.IGNORECASE), "daun-lod"),
    (re.compile(r"\bupdate\b", re.IGNORECASE), "ap-deit"),
    (re.compile(r"\bupgrade\b", re.IGNORECASE), "ap-greid"),
    (re.compile(r"\bsetup\b", re.IGNORECASE), "set-ap"),
    (re.compile(r"\bendpoints\b", re.IGNORECASE), "end-points"),
    (re.compile(r"\bendpoint\b", re.IGNORECASE), "end-point"),
    (re.compile(r"\bclient\b", re.IGNORECASE), "klayen"),
    (re.compile(r"\bboolean\b", re.IGNORECASE), "bulyan"),
    (re.compile(r"\binheritance\b", re.IGNORECASE), "in-heritans"),
    (re.compile(r"\bpolymorphism\b", re.IGNORECASE), "poli-morfism"),
    (re.compile(r"\bencapsulation\b", re.IGNORECASE), "enkapsulasi"),
    (re.compile(r"\bdependencies\b", re.IGNORECASE), "dependensis"),
    (re.compile(r"\bdependency\b", re.IGNORECASE), "dependensi"),
]

def normalize_tts_pronunciation(text: str) -> str:
    """
    Menyelaraskan istilah asing, IT, dan akronim teknis ke bentuk fonetik
    yang optimal untuk model TTS neural Bahasa Indonesia.
    """
    if not text:
        return ""
    normalized = text
    for pattern, replacement in TTS_PRONUNCIATION_DICTIONARY:
        normalized = pattern.sub(replacement, normalized)
    return normalized

class TTSRequest(BaseModel):
    text: str = Field(..., example="Kecerdasan buatan berkembang sangat pesat.")
    voice: Optional[str] = Field("id-ID-ArdiNeural", example="id-ID-ArdiNeural")

@app.post(
    "/api/tts",
    tags=["Speech Processing"],
    summary="Mengubah teks menjadi suara"
)
async def text_to_speech(payload: TTSRequest, background_tasks: BackgroundTasks):
    """
    CATATAN TEKNIK & PARAMETER TTS:
    -------------------------------
    - Engine: Edge-TTS (id-ID-ArdiNeural / id-ID-GadisNeural).
      * Beban sintesis dialihkan ke cloud endpoint Microsoft, sehingga 
        penggunaan CPU VPS mendekati 0%.
    - Normalisasi Pelafalan (Pronunciation Normalizer):
      * Istilah teknis / asing diselaraskan secara fonetis otomatis.
    - Penanganan Teks:
      * Tanda baca (titik, koma, tanya) sengaja TIDAK dihapus agar model neural
        dapat menghasilkan jeda napas, intonasi, dan prosodi alami.
    - Cleanup:
      * File .mp3 sementara otomatis dihapus via BackgroundTasks setelah
        berhasil dikirimkan ke frontend.
    """
    input_text = payload.text.strip()
    if not input_text:
        raise HTTPException(status_code=400, detail="Teks tidak boleh kosong.")

    # Terapkan kamus normalisasi pelafalan istilah asing / IT
    normalized_text = normalize_tts_pronunciation(input_text)

    temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    temp_audio_path = temp_audio.name
    temp_audio.close()

    try:
        communicate = edge_tts.Communicate(text=normalized_text, voice=payload.voice)
        await communicate.save(temp_audio_path)
    except Exception as e:
        remove_file(temp_audio_path)
        raise HTTPException(status_code=500, detail=f"Gagal sintesis audio: {str(e)}")

    background_tasks.add_task(remove_file, temp_audio_path)
    return FileResponse(path=temp_audio_path, media_type="audio/mpeg", filename="speech.mp3")


# ==============================================================================
# HELPER NLP PERKULIAHAN (FILTERING, EXTRACTION, FORMATTING)
# ==============================================================================
def filter_lecture_sentences(raw_text: str):
    """Menyaring kalimat obrolan/basa-basi dosen (salam, cek mic, slide, presensi)"""
    sentences = split_sentences(raw_text)
    filler_patterns = [
        r'\b(halo|hai|selamat pagi|selamat siang|selamat sore|selamat malam)\b',
        r'\b(suara saya|terdengar|cek mic|tes mic|dengar suara)\b',
        r'\b(ada pertanyaan|apakah ada yang|ingin ditanyakan|sampai di sini)\b',
        r'\b(terima kasih|sampai jumpa|pertemuan hari ini kita akhiri|kita sudahi)\b',
        r'\b(share screen|layar|slide|kelihatan tidak|bisa dilihat)\b',
        r'\b(absen|presensi|kehadiran)\b',
        r'\b(baik(lah)? kita mulai|mari kita mulai|langsung saja masuk ke materi)\b',
    ]
    valid = []
    for s in sentences:
        if len(s.split()) < 3:
            continue
        if any(re.search(p, s, re.I) for p in filler_patterns):
            continue
        valid.append(s)
    return valid

def clean_display_sentence(sent: str) -> str:
    """Membersihkan kalimat materi dari awalan pembuka sesi sebelum ditampilkan"""
    s = sent.strip()
    intro_patterns = [
        r'^(hari ini di pertemuan (ke-\d+|\w+) kita akan (mempelajari|membahas)\s*)',
        r'^(hari ini kita (akan )?(membahas|mempelajari|belajar)( tentang| mengenai)?\s*)',
        r'^(dalam sistem basis data,?\s*(kita mengenal\s*)?)',
        r'^(seperti yang (sudah )?dijelaskan,?\s*)',
        r'^(kita juga perlu (melakukan )?\s*)',
        r'^(perlu diketahui bahwa\s*)',
        r'^(silakan dipahami konsep ini karena\s*)',
    ]
    for pat in intro_patterns:
        s = re.sub(pat, '', s, flags=re.IGNORECASE)
    s = s.strip()
    if s:
        s = s[0].upper() + s[1:]
    if not s.endswith(('.', '!', '?')):
        s += '.'
    return s

def clean_subnode_label(text: str) -> str:
    """Membersihkan teks menjadi label sub-topik mindmap yang ringkas dan padat"""
    s = text.strip().rstrip('.,;:!?')
    if s.lower() in AUX_STOP_WORDS:
        return ''
    s = re.sub(r'^(terdiri dari|meliputi|seperti|yaitu|adalah|bahwa|merupakan|dalam|pada|untuk|agar|tujuan utama dari|kita mengenal|proses)\s+', '', s, flags=re.I)
    s = re.sub(r'\s+(yang|adalah|yaitu|merupakan|dan|atau|serta)$', '', s, flags=re.I)
    s = s.strip()
    if s.lower() in AUX_STOP_WORDS:
        return ''
    if len(s.split()) < 2 and len(s) < 6:
        return ''
    if s:
        s = s[0].upper() + s[1:]
    return s

def extract_sub_clauses(sentence: str):
    """Mengekstrak klausa konsep dari kalimat perkuliahan"""
    s = sentence.strip().rstrip('.,;:!?')
    s = re.sub(r'^(hari ini di pertemuan (ke-\d+|\w+) kita akan (mempelajari|membahas)\s*)', '', s, flags=re.I)
    s = re.sub(r'^(dalam sistem basis data,?\s*(kita mengenal\s*)?)', '', s, flags=re.I)
    s = re.sub(r'^(kita juga perlu (melakukan )?\s*)', '', s, flags=re.I)
    s = re.sub(r'^(perlu diketahui bahwa\s*)', '', s, flags=re.I)
    s = re.sub(r'^(silakan dipahami konsep ini karena\s*)', '', s, flags=re.I)
    s = re.sub(r'^(ada beberapa jenis\s*)', '', s, flags=re.I)
    s = re.sub(r'^(selain primary key,?\s*)', '', s, flags=re.I)
    s = re.sub(r'^(setiap tabel harus memiliki\s*)', '', s, flags=re.I)
    s = s.strip()

    delims = r'\b(?:agar|untuk|sehingga|seperti|yaitu|adalah|terdiri dari|meliputi|hingga|sampai)\b|[,;]'
    parts = [p.strip() for p in re.split(delims, s, flags=re.I) if p and len(p.strip().split()) >= 1]
    res = []
    for p in parts:
        cleaned_lbl = clean_subnode_label(p)
        if cleaned_lbl and len(cleaned_lbl) <= 80:
            res.append(cleaned_lbl)
    if not res and s:
        cleaned_fallback = clean_subnode_label(s)
        if cleaned_fallback:
            if len(cleaned_fallback) > 75:
                words = cleaned_fallback.split()
                cleaned_fallback = " ".join(words[:8])
            res = [cleaned_fallback]
    return res[:3]


# ==============================================================================
# 3. ENDPOINT: ENHANCED TEXT SUMMARIZATION
# ==============================================================================
class SummarizeRequest(BaseModel):
    text: str = Field(..., example="Pendidikan inklusif adalah sistem pendidikan...")
    summary_ratio: Optional[float] = Field(0.3, ge=0.1, le=1.0, description="Persentase kalimat yang diambil")

@app.post(
    "/api/summarize",
    tags=["NLP"],
    summary="Meringkas transkrip perkuliahan dengan format terstruktur & kata kunci"
)
async def summarize_text(payload: SummarizeRequest):
    """
    SUMMARIZATION PERKULIAHAN BERBASIS TEXTRANK & KATA KUNCI:
    - Menyingkirkan obrolan basa-basi (cek suara, presensi, salam).
    - PageRank scoring pada kalimat substantif materi.
    - Format output terstruktur:
      * 📌 Intisari Perkuliahan (ringkasan eksekutif)
      * 🎯 Poin-Poin Kunci (bullet points)
      * 🔑 Kata Kunci & Topik Utama (tag konsep penting)
    """
    raw_text = payload.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Teks tidak boleh kosong.")

    valid_sentences = filter_lecture_sentences(raw_text)
    if not valid_sentences:
        valid_sentences = split_sentences(raw_text)
    if not valid_sentences:
        valid_sentences = [raw_text]

    if len(valid_sentences) <= 2:
        return {
            "summary": " ".join(valid_sentences),
            "original_sentences": len(valid_sentences),
            "summary_sentences": len(valid_sentences)
        }

    # Preprocessing
    cleaned_sentences = []
    for sent in valid_sentences:
        s = sent.lower()
        s = re.sub(r'[^a-zA-Z0-9\s]', ' ', s)
        words = [w for w in s.split() if w not in ALL_STOPWORDS and len(w) > 2]
        cleaned_sentences.append(" ".join(words))

    # TextRank Matrix
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform(cleaned_sentences)
        sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
        np.fill_diagonal(sim_matrix, 0)
        graph = nx.from_numpy_array(sim_matrix)
        scores = nx.pagerank(graph, alpha=0.85, max_iter=200)
    except Exception:
        scores = {i: 1.0 for i in range(len(valid_sentences))}

    # Ranked Sentences
    ranked = sorted(scores.keys(), key=lambda i: scores[i], reverse=True)
    num_points = max(2, min(5, int(len(valid_sentences) * payload.summary_ratio)))
    top_indices = sorted(ranked[:num_points])

    # Abstract (1-2 most central sentences)
    abstract_indices = sorted(ranked[:min(2, len(ranked))])
    abstract_text = " ".join([clean_display_sentence(valid_sentences[i]) for i in abstract_indices])

    # Bullets
    bullets = [f"• {clean_display_sentence(valid_sentences[i])}" for i in top_indices]

    # Ekstraksi Kata Kunci Utama
    try:
        kw_vec = TfidfVectorizer(ngram_range=(1, 2), stop_words=list(ALL_STOPWORDS), max_features=15)
        kw_mat = kw_vec.fit_transform([" ".join(cleaned_sentences)])
        kw_feats = kw_vec.get_feature_names_out()
        kw_scores = zip(kw_feats, kw_mat.toarray()[0])
        top_keywords = [
            re.sub(r'\s+', ' ', k).title()
            for k, sc in sorted(kw_scores, key=lambda x: x[1], reverse=True)[:6]
            if len(k) > 3
        ]
    except Exception:
        top_keywords = []

    # Coba gunakan Gemini API terlebih dahulu (Hybrid Mode)
    if GEMINI_API_KEY and len(raw_text) >= 20:
        gemini_prompt = (
            "Buatlah ringkasan terstruktur dari materi perkuliahan berikut dalam Bahasa Indonesia yang formal dan akademik.\n"
            "Aturan Penting:\n"
            "- DILARANG menggunakan emote atau emoji sama sekali dalam seluruh dokumen.\n"
            "- Format dokumen WAJIB persis seperti berikut:\n\n"
            "INTISARI PERKULIAHAN\n"
            "(1-2 paragraf intisari materi utama perkuliahan)\n\n"
            "POIN-POIN KUNCI\n"
            "- (Poin materi penting 1)\n"
            "- (Poin materi penting 2)\n"
            "- (dst)\n\n"
            "KATA KUNCI & TOPIK UTAMA\n"
            "(Daftar kata kunci penting dipisahkan koma)\n\n"
            f"Materi Perkuliahan:\n{raw_text}"
        )
        gemini_res = await call_gemini_api(gemini_prompt, timeout=15.0)
        if gemini_res:
            clean_res = re.sub(r'[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF\s.,!?:;\-\(\)/%#•]', '', gemini_res).strip()
            return {
                "summary": clean_res,
                "original_sentences": len(valid_sentences),
                "summary_sentences": num_points
            }

    # Format fallback lokal dengan header rapi (tanpa emote)
    summary_sections = [
        "INTISARI PERKULIAHAN",
        abstract_text,
        "",
        "POIN-POIN KUNCI",
        "\n".join(bullets)
    ]

    if top_keywords:
        summary_sections.append("")
        summary_sections.append("KATA KUNCI & TOPIK UTAMA")
        summary_sections.append(", ".join(top_keywords))

    return {
        "summary": "\n".join(summary_sections),
        "original_sentences": len(valid_sentences),
        "summary_sentences": num_points
    }


# ==============================================================================
# 4. ENDPOINT: ENHANCED MINDMAP GENERATOR
# ==============================================================================
class MindmapRequest(BaseModel):
    text: str = Field(..., example="Kecerdasan buatan berkembang...")
    title: Optional[str] = Field("Topik Perkuliahan", example="Sistem Informasi")

@app.post(
    "/api/mindmap",
    tags=["NLP"],
    summary="Mengekstrak struktur hierarki mindmap tematik dari materi perkuliahan"
)
async def generate_mindmap(payload: MindmapRequest):
    """
    MINDMAP TEMATIK BERBASIS NLP & GEMINI HYBRID:
    - Mode Hybrid: Mengutamakan Gemini API untuk struktur hierarki konsep yang cerdas.
    - Fallback Lokal: Mengelompokkan materi ke tema konsep inti tanpa emote.
    - Menghasilkan format JSON yang kompatibel penuh dengan MindmapView frontend.
    """
    raw_text = payload.text.strip()
    root_title = payload.title.strip() if payload.title else "Topik Perkuliahan"
    if not raw_text:
        return {
            "id": "root",
            "label": root_title,
            "children": []
        }

    # Coba gunakan Gemini API terlebih dahulu (Hybrid Mode)
    if GEMINI_API_KEY and len(raw_text) >= 20:
        gemini_prompt = (
            "Ekstrak hierarki konsep perkuliahan dari materi berikut ke dalam format JSON valid.\n"
            "Aturan Penting:\n"
            f"- Root label harus persis berisi judul topik: {root_title}.\n"
            "- Struktur JSON wajib persis seperti skema ini:\n"
            "{\n"
            f'  "id": "root",\n'
            f'  "label": "{root_title}",\n'
            '  "children": [\n'
            '    {\n'
            '      "id": "node-1",\n'
            '      "label": "Nama Cabang Konsep 1",\n'
            '      "children": [\n'
            '        { "id": "node-1-1", "label": "Sub-poin konsep ringkas" }\n'
            '      ]\n'
            '    }\n'
            '  ]\n'
            '}\n'
            "- Buat 3 hingga 5 cabang utama (children dari root).\n"
            "- Setiap cabang memiliki 2 hingga 4 sub-poin ringkas (children dari cabang).\n"
            "- DILARANG menggunakan emote atau emoji sama sekali.\n"
            "- Kembalikan HANYA teks JSON valid tanpa pembungkus markdown apapun.\n\n"
            f"Materi Perkuliahan:\n{raw_text}"
        )
        gemini_res = await call_gemini_api(gemini_prompt, timeout=15.0)
        if gemini_res:
            raw_json = gemini_res.strip()
            if raw_json.startswith("```"):
                parts = raw_json.split("```")
                if len(parts) >= 2:
                    raw_json = parts[1]
                    if raw_json.startswith("json"):
                        raw_json = raw_json[4:]
            raw_json = raw_json.strip()
            try:
                parsed = json.loads(raw_json)
                if isinstance(parsed, dict) and "children" in parsed and parsed["children"]:
                    parsed["id"] = "root"
                    parsed["label"] = root_title
                    return parsed
            except Exception as e:
                print(f"[Gemini Mindmap] Parse JSON gagal, beralih ke lokal: {e}")

    sentences = filter_lecture_sentences(raw_text)
    if not sentences:
        sentences = split_sentences(raw_text)
    if not sentences:
        sentences = [raw_text]

    # Kelompokkan kalimat ke dalam tema konsep (Fallback lokal)
    branches_dict = defaultdict(list)
    unmatched_sentences = []

    for s in sentences:
        s_lower = s.lower()
        matched = False
        for pat, theme_name in ACADEMIC_THEMES:
            if re.search(pat, s_lower):
                branches_dict[theme_name].append(s)
                matched = True
                break
        if not matched:
            unmatched_sentences.append(s)

    children = []
    b_idx = 1
    for theme_name, s_list in branches_dict.items():
        sub_items = []
        theme_words = set(theme_name.lower().split())
        
        candidates = []
        for s in s_list:
            for c in extract_sub_clauses(s):
                if c and c not in candidates:
                    candidates.append(c)

        for c in candidates:
            c_words = set(c.lower().split())
            if len(c.split()) > 1 and not c_words.issubset(theme_words):
                sub_items.append({
                    "id": f"node-{b_idx}-{len(sub_items)+1}",
                    "label": c
                })
                if len(sub_items) >= 4:
                    break

        if not sub_items and candidates:
            for c in candidates[:3]:
                sub_items.append({
                    "id": f"node-{b_idx}-{len(sub_items)+1}",
                    "label": c
                })

        children.append({
            "id": f"node-{b_idx}",
            "label": theme_name,
            "children": sub_items
        })
        b_idx += 1

    # Tangani kalimat tanpa tema khusus (topik umum / non-IT)
    if unmatched_sentences:
        if not children:
            chunk_size = max(1, len(unmatched_sentences) // 3)
            for i in range(0, len(unmatched_sentences), chunk_size):
                chunk = unmatched_sentences[i:i+chunk_size]
                first_sent = clean_display_sentence(chunk[0]).rstrip('.')
                words = first_sent.split()
                b_title = " ".join(words[:4]).title() if len(words) >= 4 else first_sent
                
                sub_items = []
                for s in chunk:
                    clauses = extract_sub_clauses(s)
                    for c in clauses:
                        if c not in [item["label"] for item in sub_items]:
                            sub_items.append({
                                "id": f"node-{b_idx}-{len(sub_items)+1}",
                                "label": c
                            })
                children.append({
                    "id": f"node-{b_idx}",
                    "label": b_title,
                    "children": sub_items[:4]
                })
                b_idx += 1
        else:
            for s in unmatched_sentences[:2]:
                clauses = extract_sub_clauses(s)
                if clauses:
                    children.append({
                        "id": f"node-{b_idx}",
                        "label": clean_display_sentence(s)[:40].title().rstrip('.'),
                        "children": [{"id": f"node-{b_idx}-1", "label": c} for c in clauses[:3]]
                    })
                    b_idx += 1

    return {
        "id": "root",
        "label": root_title,
        "children": children[:5]
    }