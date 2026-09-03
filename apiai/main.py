import os
import re
import shutil
import tempfile
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
import networkx as nx
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.background import BackgroundTasks
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from faster_whisper import WhisperModel
import edge_tts

# ==============================================================================
# INISIALISASI KOMPONEN NLP & STATE GLOBAL
# ==============================================================================
# Stopword Sastrawi diinisialisasi sekali di awal untuk efisiensi memori.
stop_factory = StopWordRemoverFactory()
STOPWORDS = set(stop_factory.get_stop_words())

models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    DOKUMENTASI LIFESPAN (ASR / STT MODEL LOADING):
    ------------------------------------------------
    - Model: Faster-Whisper "base"
      * Alasan: Model "large" dan "medium" memerlukan resource komputasi tinggi
        yang menyebabkan latensi tinggi dan konsumsi RAM besar di VPS CPU.
        Model "base" memberikan trade-off optimal antara kecepatan dan akurasi.
    - Device: "cpu"
    - Kuantisasi (compute_type): "int8"
      * Alasan: Mengurangi penggunaan RAM hingga ~50% dan mempercepat inferensi
        vektor pada CPU (AVX2/AVX-512) dibanding float32/float16.
    - CPU Threads: Diset 4 (sesuaikan dengan alokasi vCPU VPS Anda).
    """
    models["whisper"] = WhisperModel(
        "base",
        device="cpu",
        compute_type="int8",
        cpu_threads=4
    )
    yield
    models.clear()

app = FastAPI(
    title="Voice & Text Processing API",
    description="Layanan backend terintegrasi: STT, TTS, dan Text Summarization dioptimalkan untuk CPU.",
    version="1.0.0",
    lifespan=lifespan
)

# ==============================================================================
# HELPER UTILITIES
# ==============================================================================
def split_sentences(text: str):
    """Segmentasi kalimat berbasis regex tanda baca (. ! ?)"""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 0]

def remove_file(path: str):
    """Menghapus file sementara untuk mencegah penumpukan storage"""
    if os.path.exists(path):
        os.remove(path)


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
    - Engine: Faster-Whisper (CTranslate2 backend).
    - beam_size=1:
      * Menggunakan greedy search. Menurunkan latensi secara drastis dibanding
        beam_size=5 atau 10 tanpa degradasi akurasi yang signifikan untuk input jelas.
    - vad_filter=True:
      * Mengaktifkan Silero VAD bawaan untuk memangkas jeda hening/sunyi,
        sehingga CPU tidak membuang siklus kalkulasi pada bagian tanpa suara.
    - Tanpa noisereduce terpisah:
      * Noise reduction Python berbasis STFT dihilangkan karena memakan waktu
        pemrosesan CPU yang signifikan.
    - Non-blocking Execution:
      * Transkripsi dijalankan via loop.run_in_executor agar thread FastAPI
        tidak terblokir oleh komputasi sinkron Whisper.
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
                beam_size=1,
                vad_filter=True,
                temperature=0
            )
            text = "".join(seg.text for seg in segments).strip()
            return text, info

        transcription, info = await loop.run_in_executor(None, do_transcribe)

        return {
            "text": transcription,
            "duration": round(info.duration, 2),
            "language": info.language
        }
    finally:
        remove_file(temp_audio_path)


# ==============================================================================
# 2. ENDPOINT: TEXT-TO-SPEECH (TTS)
# ==============================================================================
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

    temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    temp_audio_path = temp_audio.name
    temp_audio.close()

    try:
        communicate = edge_tts.Communicate(text=input_text, voice=payload.voice)
        await communicate.save(temp_audio_path)
    except Exception as e:
        remove_file(temp_audio_path)
        raise HTTPException(status_code=500, detail=f"Gagal sintesis audio: {str(e)}")

    background_tasks.add_task(remove_file, temp_audio_path)
    return FileResponse(path=temp_audio_path, media_type="audio/mpeg", filename="speech.mp3")


# ==============================================================================
# 3. ENDPOINT: TEXT SUMMARIZATION
# ==============================================================================
class SummarizeRequest(BaseModel):
    text: str = Field(..., example="Pendidikan inklusif adalah sistem pendidikan...")
    summary_ratio: Optional[float] = Field(0.3, ge=0.1, le=1.0, description="Persentase kalimat yang diambil")

@app.post(
    "/api/summarize",
    tags=["NLP"],
    summary="Meringkas kalimat atau paragraf"
)
async def summarize_text(payload: SummarizeRequest):
    """
    CATATAN TEKNIK & PARAMETER SUMMARIZATION:
    -----------------------------------------
    - Algoritma: TextRank (Graph-based Ranking via PageRank alpha=0.85).
    - Similarity Metric: Cosine Similarity berbasis TF-IDF.
      * Lebih unggul dari Jaccard karena memperhitungkan bobot kata global.
      * Implementasi scikit-learn teroptimasi BLAS/C, jauh lebih cepat dari
        loop manual set intersection Jaccard di Python.
    - Strategi Preprocessing:
      * Stopword Removal Sastrawi aktif.
      * Stemming Sastrawi DINONAKTIFKAN karena algoritma berbasis regex-nya
        sangat lambat di CPU (menambah latensi 1-2 detik per paragraf).
        TF-IDF tanpa stemming sudah cukup akurat dan selesai dalam <0.05 detik.
    - Rekonstruksi Output:
      * Kalimat terpilih diurutkan kembali berdasarkan indeks asli teks sumber
        agar alur informasi tetap koheren.
    """
    raw_text = payload.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Teks tidak boleh kosong.")

    sentences = split_sentences(raw_text)
    if len(sentences) < 2:
        return {
            "summary": raw_text,
            "original_sentences": len(sentences),
            "summary_sentences": len(sentences)
        }

    # 1. Preprocessing: Lowercase, filter non-alphanumeric, stopword removal
    cleaned_sentences = []
    for sent in sentences:
        s = sent.lower()
        s = re.sub(r'[^a-zA-Z0-9\s]', ' ', s)
        words = [w for w in s.split() if w not in STOPWORDS]
        cleaned_sentences.append(" ".join(words))

    # 2. Vektorisasi TF-IDF & Matriks Cosine Similarity
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform(cleaned_sentences)
    except ValueError:
        return {
            "summary": raw_text,
            "original_sentences": len(sentences),
            "summary_sentences": len(sentences)
        }

    sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    np.fill_diagonal(sim_matrix, 0)

    # 3. PageRank Scoring
    graph = nx.from_numpy_array(sim_matrix)
    scores = nx.pagerank(graph, alpha=0.85)

    # 4. Pemilihan Kalimat & Pengurutan Ulang
    ranked_sentences = sorted(
        ((scores[i], idx, s) for i, (idx, s) in enumerate(enumerate(sentences))),
        reverse=True
    )

    num_summary = max(1, int(len(sentences) * payload.summary_ratio))
    selected = sorted(ranked_sentences[:num_summary], key=lambda x: x[1])
    summary_result = " ".join([item[2] for item in selected])

    return {
        "summary": summary_result,
        "original_sentences": len(sentences),
        "summary_sentences": num_summary
    }