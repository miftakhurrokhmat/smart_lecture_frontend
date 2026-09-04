import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Mic, Square, Pause, ChevronLeft, Search, Users, 
  MessageSquare, Sparkles, Send, MoreVertical, 
  FileText, Activity, CircleDot, Plus, CheckCircle2
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

function MindmapView({ data }: { data: any }) {
  if (!data || !data.children) return null;
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.children.map((branch: any, idx: number) => (
          <div key={branch.id || idx} className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-start gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="font-bold text-sm text-gray-900 leading-snug">{branch.label}</p>
            </div>
            {branch.children && branch.children.length > 0 && (
              <div className="space-y-1.5 pl-4 border-l-2 border-purple-200 mt-2">
                {branch.children.map((sub: any, sIdx: number) => (
                  <div key={sub.id || sIdx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DosenSesiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State UI
  const [isRecording, setIsRecording] = useState(false);
  const [leftTab, setLeftTab] = useState<"transkrip" | "ai">("transkrip");
  const [rightTab, setRightTab] = useState<"mahasiswa" | "diskusi" | "materi">("mahasiswa");
  const [isEnding, setIsEnding] = useState(false);

  // State Data
  const [sessionData, setSessionData] = useState<any>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mahasiswa, setMahasiswa] = useState<any[]>([]);
  const [activeUserIds, setActiveUserIds] = useState<string[]>([]);
  const [diskusi, setDiskusi] = useState<any[]>([]);
  const [materiSesi, setMateriSesi] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [transkripsi, setTranskripsi] = useState<any[]>([]);

  // State Audio Spectrum Real-time (40 bars/dots)
  const [spectrumBars, setSpectrumBars] = useState<number[]>(Array(40).fill(6));
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Timer berjalan sesuai waktu sesi asli
  useEffect(() => {
    if (!sessionData?.startTime) return;
    const start = new Date(sessionData.startTime).getTime();
    
    const updateElapsed = () => {
      const end = sessionData.status === "completed" && sessionData.endTime
        ? new Date(sessionData.endTime).getTime()
        : Date.now();
      const diff = Math.max(0, Math.floor((end - start) / 1000));
      setElapsedSeconds(diff);
    };
    updateElapsed();
    if (sessionData.status === "completed") return;
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [sessionData?.startTime, sessionData?.status, sessionData?.endTime]);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // 2. Fetch data awal & Socket setup
  useEffect(() => {
    if (!id) return;

    // Ambil detail sesi real (nama matkul, kelas, dosen, waktu)
    fetch(`/api/dosen/sessions/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSessionData(data.data);
          // Ubah status jadi LIVE di DB HANYA jika sesi belum selesai
          if (data.data.status !== "completed") {
            fetch(`/api/dosen/sessions/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "live" })
            }).catch(err => console.error(err));
          }
        }
      });

    // Ambil transkrip yang tersimpan di database
    fetch(`/api/dosen/sessions/${id}/transcripts`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const formatted = data.data.map((t: any) => ({
            waktu: new Date(t.timeRecorded).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            speaker: t.speakerName || "Dosen",
            teks: t.text
          }));
          setTranskripsi(formatted);
        }
      });

    // Fetch mahasiswa kelas, diskusi, dan materi sesi
    fetch(`/api/dosen/sessions/${id}/students`).then(res=>res.json()).then(data => data.success && setMahasiswa(data.data));
    fetch(`/api/dosen/sessions/${id}/discussions`).then(res=>res.json()).then(data => data.success && setDiskusi(data.data));
    fetch(`/api/dosen/sessions/${id}/materials`).then(res=>res.json()).then(data => data.success && setMateriSesi(data.data));

    // Setup Socket.IO
    socketRef.current = io();
    socketRef.current.emit("join-session", { sessionId: id, user });

    socketRef.current.on("chat-update", (chat) => {
      setDiskusi(prev => [...prev, chat]);
    });
    
    socketRef.current.on("active-users-update", (userIds) => {
      setActiveUserIds(userIds);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id, user]);

  // 3. Heartbeat status dosen ke mahasiswa via socket
  useEffect(() => {
    if (!id || !user || sessionData?.status === "completed") return;
    const pingInterval = setInterval(() => {
      socketRef.current?.emit("dosen-ping", {
        sessionId: id,
        isRecording: isRecordingRef.current,
        timestamp: Date.now()
      });
    }, 4000);
    return () => clearInterval(pingInterval);
  }, [id, user, sessionData?.status]);

  const sendChat = async () => {
    if (sessionData?.status === "completed" || !chatInput.trim() || !user || !id) return;
    try {
      const res = await fetch(`/api/dosen/sessions/${id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, text: chatInput })
      });
      const data = await res.json();
      if (data.success) {
        socketRef.current?.emit("chat-message", { ...data.data, sessionId: id });
        setChatInput("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const akhiriSesi = async () => {
    if (!confirm("Yakin ingin mengakhiri sesi kuliah? Seluruh transkrip akan otomatis diringkas dan dibuatkan Mindmap AI.")) return;
    
    setIsEnding(true);
    try {
      if (isRecording) {
        stopRecording();
      }

      const res = await fetch(`/api/dosen/sessions/${id}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        // Broadcast sesi telah diakhiri ke seluruh mahasiswa
        socketRef.current?.emit("session-ended", { sessionId: id, status: "completed" });

        alert("Sesi berhasil diakhiri! Ringkasan dan Mindmap AI telah berhasil diproses.");
        navigate("/dosen/jadwal");
      } else {
        alert("Gagal mengakhiri sesi: " + (data.message || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Gagal mengakhiri sesi");
    } finally {
      setIsEnding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Validasi Gagal: Hanya file format PDF yang diperbolehkan!");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("sessionId", id);
    formData.append("file", file);

    try {
      const res = await fetch("/api/dosen/materials", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMateriSesi(prev => [data.data, ...prev]);
        alert("Dokumen PDF materi berhasil dibagikan!");
      } else {
        alert(data.message || "Gagal mengunggah materi");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengunggah materi");
    } finally {
      e.target.value = "";
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setIsSpeaking(false);
    setSpectrumBars(Array(40).fill(6));

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch(e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (socketRef.current && id) {
      socketRef.current.emit("dosen-audio-spectrum", {
        sessionId: id,
        isRecording: false,
        isSpeaking: false,
        volume: 0,
        bars: Array(40).fill(6)
      });
      socketRef.current.emit("dosen-ping", {
        sessionId: id,
        isRecording: false,
        timestamp: Date.now()
      });
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Mulai Perekaman
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Inisialisasi Web Audio API untuk deteksi spektrum frekuensi asli
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128; // Menghasilkan 64 bin frekuensi
        analyser.smoothingTimeConstant = 0.65;
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let lastEmit = 0;

        const updateAudioMeter = () => {
          if (!isRecordingRef.current) {
            setSpectrumBars(Array(40).fill(6));
            setIsSpeaking(false);
            return;
          }

          analyser.getByteFrequencyData(dataArray);

          // Hitung rata-rata amplitudo suara vokal
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const speaking = avg > 12; // Threshold hening vs bicara

          setIsSpeaking(speaking);

          let currentBars: number[];
          if (!speaking) {
            // Jika dosen hening / diam -> semua bar jadi titik datar (6px)
            currentBars = Array(40).fill(6);
            setSpectrumBars(currentBars);
          } else {
            // Jika dosen bicara -> spektrum bergerak naik-turun sesuai frekuensi suara vokal
            currentBars = Array.from({ length: 40 }, (_, i) => {
              const binIdx = Math.min(dataArray.length - 1, Math.floor(1 + (i / 40) * 28));
              const val = dataArray[binIdx] || 0;
              if (val < 18) return 6; // Tetap titik untuk frekuensi lemah / hening
              const normalized = (val - 18) / 237;
              return Math.min(34, Math.max(6, Math.round(6 + normalized * 28)));
            });
            setSpectrumBars(currentBars);
          }

          // Emit spektrum audio ke mahasiswa via socket setiap 100ms
          const now = Date.now();
          if (now - lastEmit > 100) {
            lastEmit = now;
            socketRef.current?.emit("dosen-audio-spectrum", {
              sessionId: id,
              isRecording: true,
              isSpeaking: speaking,
              volume: speaking ? Math.round((avg / 255) * 100) : 0,
              bars: currentBars
            });
          }

          animFrameRef.current = requestAnimationFrame(updateAudioMeter);
        };

        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;

        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mr.onstop = async () => {
          if (chunksRef.current.length === 0) return;
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          chunksRef.current = [];

          const formData = new FormData();
          formData.append("file", audioBlob, "chunk.webm");

          try {
            const res = await fetch("http://localhost:8000/api/stt", {
              method: "POST",
              body: formData
            });
            if (res.ok) {
              const data = await res.json();
              if (data.text && data.text.trim() !== "") {
                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
                
                const speakerName = sessionData?.dosenName || user?.name || "Dosen";
                const newTranscript = { sessionId: id, waktu: timeStr, speaker: speakerName, teks: data.text };
                
                setTranskripsi(prev => [...prev, newTranscript]);
                
                if (socketRef.current) {
                  socketRef.current.emit("transcript-chunk", newTranscript);
                }

                if (user?.id && id) {
                  fetch(`/api/dosen/sessions/${id}/transcripts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      speakerId: user.id,
                      text: data.text,
                      timeRecorded: now.toISOString()
                    })
                  }).catch(e => console.error("Gagal simpan transkrip ke DB:", e));
                }
              }
            }
          } catch (err) {
            console.error("Gagal transkripsi STT:", err);
          }

          if (isRecordingRef.current) {
            try { mr.start(); } catch(e) {}
          }
        };

        mr.start();
        setIsRecording(true);
        isRecordingRef.current = true;

        animFrameRef.current = requestAnimationFrame(updateAudioMeter);

        // Chunking audio tiap 8 detik
        intervalRef.current = setInterval(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        }, 8000);

      } catch (err) {
        alert("Akses mikrofon ditolak atau tidak tersedia!");
        console.error(err);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transkripsi]);

  useEffect(() => {
    if (rightTab === "diskusi") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [diskusi, rightTab]);


  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gray-50 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link to="/dosen/jadwal" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {sessionData?.courseName ? `${sessionData.courseName} - ${sessionData.title}` : "Memuat Sesi..."}
              </h1>
              {sessionData?.status === "completed" ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                  SELESAI
                </span>
              ) : isRecording ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold animate-pulse border border-red-100">
                  <CircleDot className="w-3 h-3" /> LIVE
                </span>
              ) : null}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
              Topik: {sessionData?.title || "-"} • Kelas {sessionData?.classGroup || "-"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <div className="text-center px-4 border-r border-gray-200">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Durasi</p>
            <p className="text-lg font-bold text-gray-900 font-mono">{formatTimer(elapsedSeconds)}</p>
          </div>
          {sessionData?.status === "completed" ? (
            <div className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Sesi Telah Berakhir
            </div>
          ) : (
            <button 
              onClick={akhiriSesi} 
              disabled={isEnding}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              {isEnding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses Ringkasan AI...
                </>
              ) : "Akhiri Sesi"}
            </button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        
        {/* Left Area: Transkrip & AI */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-gray-200 bg-white h-[500px] lg:h-auto">
          
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-2 sm:py-0 bg-gray-50/50 gap-3 flex-shrink-0">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap">
              <button 
                onClick={() => setLeftTab("transkrip")}
                className={`py-3 sm:py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${leftTab === "transkrip" ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <FileText className="w-4 h-4" /> Transkripsi Real-time
              </button>
              <button 
                onClick={() => setLeftTab("ai")}
                className={`py-3 sm:py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${leftTab === "ai" ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <Sparkles className="w-4 h-4" /> Insight AI (Smart Lecture)
              </button>
            </div>
            {leftTab === "transkrip" && (
              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari dalam transkripsi..." 
                  className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
                />
              </div>
            )}
          </div>

          {/* Transcript Content */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth min-h-0">
            {leftTab === "transkrip" ? (
              transkripsi.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-10 py-4">
                  Belum ada transkripsi... Klik tombol mikrofon untuk mulai merekam.
                </div>
              ) : (
                <div className="relative pl-6 space-y-5">
                  {/* Continuous purple vertical timeline line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-purple-300"></div>

                  {transkripsi.map((item, idx) => {
                    const isLatest = idx === transkripsi.length - 1;
                    const dosenDisplayName = sessionData?.dosenName || user?.name || "Dosen Pengampu";

                    return (
                      <div key={idx} className="relative group">
                        {/* Timeline purple dot */}
                        <div className="absolute -left-[23px] top-2.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white shadow-xs z-10"></div>

                        {/* Content Box */}
                        <div className={`transition-all duration-200 ${
                          isLatest 
                            ? "bg-purple-50/70 p-4 rounded-2xl border border-purple-100/60 shadow-xs" 
                            : "p-2 rounded-xl hover:bg-purple-50/30"
                        }`}>
                          {/* Header: Timestamp + Dosen Badge with actual lecturer name */}
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-gray-500 tracking-tight">{item.waktu}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                              {dosenDisplayName}
                            </span>
                          </div>

                          {/* Transcript Body Text */}
                          <p className="text-sm text-gray-900 leading-relaxed mt-2">
                            {item.teks}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={transcriptEndRef} />
                </div>
              )
            ) : (
              <div className="h-full flex flex-col p-4 overflow-y-auto">
                {sessionData?.aiSummary || sessionData?.aiMindmapData ? (
                  <div className="space-y-6 max-w-4xl mx-auto w-full">
                    {/* Ringkasan */}
                    {sessionData.aiSummary && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-purple-800">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <h3 className="font-bold text-base">Ringkasan Materi AI</h3>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                          {sessionData.aiSummary}
                        </p>
                      </div>
                    )}

                    {/* Mindmap */}
                    {sessionData.aiMindmapData && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-purple-800">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <h3 className="font-bold text-base">Mindmap Konsep Perkuliahan</h3>
                        </div>
                        {(() => {
                          try {
                            const parsed = typeof sessionData.aiMindmapData === 'string' ? JSON.parse(sessionData.aiMindmapData) : sessionData.aiMindmapData;
                            return <MindmapView data={parsed} />;
                          } catch(e) {
                            return <p className="text-xs text-gray-500">Gagal merender data mindmap.</p>;
                          }
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 my-auto">
                    <Sparkles className="w-12 h-12 text-purple-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Generating AI Insights...</h3>
                    <p className="text-gray-500 text-sm max-w-md mb-6">
                      Sistem akan merangkum seluruh poin penting dan membuat mindmap secara otomatis ketika sesi kuliah diakhiri.
                    </p>
                    <div className="w-full max-w-md bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-full w-1/2 animate-pulse rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            {sessionData?.status === "completed" ? (
              <div className="flex items-center justify-between py-1 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                  <span>Sesi perkuliahan telah selesai. Perekaman audio dan transkripsi ditutup.</span>
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Total Durasi: {formatTimer(elapsedSeconds)}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={toggleRecording}
                    title={isRecording ? "Pause/Mute Mikrofon" : "Aktifkan Mikrofon"}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-colors ${isRecording ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-purple-600 text-white hover:bg-purple-700"}`}
                  >
                    {isRecording ? <Pause className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={stopRecording}
                    disabled={!isRecording}
                    title="Hentikan Mikrofon"
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors absolute bottom-0 -right-4 translate-x-full ${
                      isRecording 
                        ? "bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer shadow-xs" 
                        : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                </div>
                
                <div className="flex-1"></div>
                
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">
                  {!isRecording ? "Mic Nonaktif" : isSpeaking ? "Input Audio" : "Hening"}
                </div>
                <div className="hidden sm:flex items-end justify-center gap-1.5 h-10 px-4 flex-1 max-w-md mx-auto">
                  {spectrumBars.map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 rounded-full transition-all duration-75 shrink-0 ${
                        !isRecording 
                          ? "h-1.5 bg-gray-300" 
                          : !isSpeaking 
                          ? "h-1.5 bg-purple-200" 
                          : h > 6 
                          ? "bg-purple-500" 
                          : "h-1.5 bg-purple-200"
                      }`} 
                      style={{ height: isRecording && isSpeaking ? `${h}px` : "6px" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Area: Sidebar */}
        <div className="w-full lg:w-[380px] flex flex-col bg-gray-50 flex-shrink-0 h-[600px] lg:h-auto min-h-0">
          
          <div className="flex p-2 gap-1 bg-white border-b border-gray-200 overflow-x-auto flex-shrink-0">
            <button 
              onClick={() => setRightTab("mahasiswa")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5 whitespace-nowrap ${rightTab === "mahasiswa" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Users className="w-4 h-4" /> Mahasiswa ({activeUserIds.length})
            </button>
            <button 
              onClick={() => setRightTab("diskusi")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5 whitespace-nowrap ${rightTab === "diskusi" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <MessageSquare className="w-4 h-4" /> Diskusi
            </button>
            <button 
              onClick={() => setRightTab("materi")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5 whitespace-nowrap ${rightTab === "materi" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <FileText className="w-4 h-4" /> Materi
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 p-4">
            {rightTab === "mahasiswa" ? (
              <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">Aktif di sesi ({activeUserIds.length}/{mahasiswa.length})</span>
                  <button className="text-xs font-bold text-purple-600 hover:underline">Lihat semua</button>
                </div>
                {mahasiswa.map((m, i) => {
                  const aktif = activeUserIds.includes(m.id);
                  return (
                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 overflow-hidden">
                          {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="font-semibold text-sm text-gray-900">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${aktif ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className={`text-[10px] font-bold ${aktif ? "text-green-600" : "text-gray-400"}`}>
                          {aktif ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : rightTab === "diskusi" ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 min-h-0">
                  {diskusi.map((d, i) => {
                    const isDosen = d.userRole === "dosen";
                    const waktu = d.timeSent ? new Date(d.timeSent).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : '';
                    return (
                      <div key={i} className={`flex flex-col w-full ${isDosen ? "items-end" : "items-start"}`}>
                        <div className="flex items-baseline gap-2 mb-1.5 px-1">
                          <span className="text-xs font-bold text-gray-900">{d.userName}</span>
                          <span className="text-[10px] font-medium text-gray-400 uppercase">{waktu}</span>
                        </div>
                        <div className={`px-4 py-2.5 max-w-[90%] sm:max-w-[80%] rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                          isDosen 
                            ? 'bg-purple-600 text-white rounded-tr-sm' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                        }`}>
                          {d.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                {/* Chat Input */}
                {sessionData?.status === "completed" ? (
                  <div className="mt-auto bg-gray-50 rounded-xl border border-gray-200 p-2.5 flex items-center justify-center text-center shadow-sm flex-shrink-0">
                    <p className="text-xs text-gray-500 font-medium">Sesi perkuliahan telah selesai. Diskusi telah ditutup.</p>
                  </div>
                ) : (
                  <div className="mt-auto relative bg-white rounded-xl border border-gray-200 p-1 flex items-center shadow-sm flex-shrink-0">
                    <input 
                      type="text" 
                      value={chatInput} 
                      onChange={e => setChatInput(e.target.value)} 
                      onKeyDown={e => e.key === "Enter" && sendChat()}
                      placeholder="Balas diskusi..." 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 py-2 outline-none" 
                    />
                    <button onClick={sendChat} className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col space-y-4 flex-1 overflow-y-auto min-h-0 pr-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".pdf,application/pdf" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" /> Bagikan Dokumen (PDF)
                </button>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase px-1">Dibagikan ke mahasiswa</h4>
                  {materiSesi.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs bg-white rounded-xl border border-dashed border-gray-200">
                      Belum ada dokumen PDF dibagikan
                    </div>
                  ) : (
                    materiSesi.map((m) => (
                      <div key={m.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0 font-bold text-xs">
                            PDF
                          </div>
                          <div className="min-w-0">
                            <a 
                              href={m.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="font-semibold text-sm text-gray-900 truncate hover:text-purple-600 block"
                            >
                              {m.name}
                            </a>
                            <p className="text-xs text-gray-500">{m.size}</p>
                          </div>
                        </div>
                        <a 
                          href={m.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-bold text-purple-600 hover:text-purple-700 px-2.5 py-1 bg-purple-50 rounded-lg border border-purple-100 transition-colors"
                        >
                          Buka
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
