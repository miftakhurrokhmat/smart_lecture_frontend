import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, CircleDot, FileText, Send, Sparkles, 
  Search, Filter, Download, ZoomIn, ZoomOut, Maximize, 
  ChevronRight, MessageSquare, Globe, Pause, Users
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

function MindmapView({ data }: { data: any }) {
  if (!data || !data.children) return null;
  return (
    <div className="p-2">
      <div className="grid grid-cols-1 gap-3">
        {data.children.map((branch: any, idx: number) => (
          <div key={branch.id || idx} className="bg-white rounded-xl p-3 border border-purple-100 shadow-sm">
            <div className="flex items-start gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="font-bold text-xs text-gray-900 leading-snug">{branch.label}</p>
            </div>
            {branch.children && branch.children.length > 0 && (
              <div className="space-y-1 pl-3 border-l-2 border-purple-200 mt-1.5 ml-2">
                {branch.children.map((sub: any, sIdx: number) => (
                  <div key={sub.id || sIdx} className="text-[11px] text-gray-600 bg-gray-50 p-1.5 rounded border border-gray-100">
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

export default function MahasiswaSesiDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [transkripsi, setTranskripsi] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forbiddenMessage, setForbiddenMessage] = useState("");
  
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [materiList, setMateriList] = useState<any[]>([]);
  const [activePdf, setActivePdf] = useState<any>(null);
  const [activeUserIds, setActiveUserIds] = useState<string[]>([]);
  const [summaryTab, setSummaryTab] = useState<"ringkasan" | "mindmap">("ringkasan");
  
  const [dosenStatus, setDosenStatus] = useState<{ online: boolean; isRecording: boolean; latency: number; lastPing?: number }>({
    online: true,
    isRecording: true,
    latency: 24,
    lastPing: Date.now()
  });

  // State Spectrum Audio Dosen Real-time (40 bars/dots)
  const [dosenAudioBars, setDosenAudioBars] = useState<number[]>(Array(40).fill(6));
  const [dosenAudioSpeaking, setDosenAudioSpeaking] = useState<boolean>(false);
  const [dosenAudioRecording, setDosenAudioRecording] = useState<boolean>(false);

  const [diskusi, setDiskusi] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sessionDuration, setSessionDuration] = useState(0);

  // Timer dinamis sesuai waktu sesi dimulai (atau fixed duration jika sudah selesai)
  useEffect(() => {
    if (!sessionInfo?.startTime) return;
    const start = new Date(sessionInfo.startTime).getTime();
    
    if (sessionInfo.status === "completed" && sessionInfo.endTime) {
      const end = new Date(sessionInfo.endTime).getTime();
      const diff = Math.max(0, Math.floor((end - start) / 1000));
      setSessionDuration(diff);
      return;
    }

    const updateElapsed = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      setSessionDuration(diff);
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [sessionInfo?.startTime, sessionInfo?.status, sessionInfo?.endTime]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // Ping monitor dosen (jika tidak ada ping dalam 12s -> offline)
  useEffect(() => {
    const checkPing = setInterval(() => {
      setDosenStatus(prev => {
        if (prev.online && prev.lastPing && Date.now() - prev.lastPing > 12000) {
          setDosenAudioRecording(false);
          setDosenAudioSpeaking(false);
          setDosenAudioBars(Array(40).fill(6));
          return { ...prev, online: false };
        }
        return prev;
      });
    }, 4000);
    return () => clearInterval(checkPing);
  }, []);

  useEffect(() => {
    if (!id || !user) return;

    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/mahasiswa/sessions/${id}?userId=${user.id}`);
        const data = await res.json();
        
        if (!data.success) {
          setForbiddenMessage(data.message || "Akses ditolak: Anda tidak memiliki izin untuk kelas ini.");
          setLoading(false);
          return;
        }

        setSessionInfo(data.data);
        setAuthorized(true);
        setLoading(false);

        // Fetch initial discussions
        fetch(`/api/dosen/sessions/${id}/discussions`)
          .then(r => r.json())
          .then(d => { if(d.success) setDiskusi(d.data); });

        // Fetch materi perkuliahan real (PDF)
        fetch(`/api/dosen/sessions/${id}/materials`)
          .then(r => r.json())
          .then(d => {
            if (d.success && d.data) {
              setMateriList(d.data);
              const pdf = d.data.find((m: any) => m.type === "PDF" || m.name.toLowerCase().endsWith(".pdf"));
              if (pdf) setActivePdf(pdf);
            }
          });

        // Fetch riwayat transkrip dari DB (history untuk mahasiswa yang telat join / refresh)
        fetch(`/api/dosen/sessions/${id}/transcripts`)
          .then(r => r.json())
          .then(d => {
            if (d.success && d.data && d.data.length > 0) {
              const formatted = d.data.map((t: any) => ({
                waktu: new Date(t.timeRecorded).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                speaker: t.speakerName || "Dosen",
                teks: t.text
              }));
              setTranskripsi(formatted);
            }
          });

        // Access granted, init socket
        socketRef.current = io();
        socketRef.current.emit("join-session", { sessionId: id, user });
        
        socketRef.current.on("transcript-update", (tData) => {
          setTranskripsi(prev => [...prev, tData]);
        });
        
        socketRef.current.on("chat-update", (cData) => {
          setDiskusi(prev => [...prev, cData]);
        });

        socketRef.current.on("dosen-status", (statusData) => {
          const isOnline = Boolean(statusData.online);
          const isRec = Boolean(statusData.isRecording);
          setDosenStatus({
            online: isOnline,
            isRecording: isRec,
            latency: statusData.latency || 24,
            lastPing: Date.now()
          });
          if (!isOnline || !isRec) {
            setDosenAudioRecording(false);
            setDosenAudioSpeaking(false);
            setDosenAudioBars(Array(40).fill(6));
          } else {
            setDosenAudioRecording(true);
          }
        });

        socketRef.current.on("dosen-audio-spectrum-update", (data: any) => {
          if (data.sessionId === id) {
            const isRec = Boolean(data.isRecording);
            const isSpk = Boolean(data.isSpeaking);
            setDosenAudioRecording(isRec);
            setDosenAudioSpeaking(isSpk);
            if (isRec && isSpk && data.bars && Array.isArray(data.bars)) {
              setDosenAudioBars(data.bars);
            } else {
              setDosenAudioBars(Array(40).fill(6));
            }
          }
        });

        socketRef.current.on("active-users-update", (userIds) => {
          setActiveUserIds(userIds);
        });

        socketRef.current.on("session-ended", (data: any) => {
          if (data.sessionId === id) {
            // Re-fetch detail sesi untuk mengambil status completed, aiSummary & aiMindmapData
            fetch(`/api/mahasiswa/sessions/${id}?userId=${user.id}`)
              .then(r => r.json())
              .then(d => {
                if (d.success && d.data) {
                  setSessionInfo(d.data);
                }
              });

            // Re-fetch riwayat transkrip lengkap
            fetch(`/api/dosen/sessions/${id}/transcripts`)
              .then(r => r.json())
              .then(d => {
                if (d.success && d.data && d.data.length > 0) {
                  const formatted = d.data.map((t: any) => ({
                    waktu: new Date(t.timeRecorded).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                    speaker: t.speakerName || "Dosen",
                    teks: t.text
                  }));
                  setTranskripsi(formatted);
                }
              });

            // Hentikan spektrum & audio
            setDosenAudioRecording(false);
            setDosenAudioSpeaking(false);
            setDosenAudioBars(Array(40).fill(6));
            setDosenStatus(prev => ({ ...prev, isRecording: false }));
          }
        });

      } catch (e) {
        console.error(e);
        setForbiddenMessage("Terjadi kesalahan sistem saat memverifikasi akses.");
        setLoading(false);
      }
    };

    checkAccess();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id, user, navigate]);

  // Fungsi Download Transkrip (.txt)
  const downloadTranscript = () => {
    if (sessionInfo?.status !== "completed") {
      alert("Transkrip lengkap baru dapat diunduh setelah sesi perkuliahan selesai diakhiri oleh dosen.");
      return;
    }

    if (transkripsi.length === 0) {
      alert("Belum ada transkrip yang tercatat untuk sesi ini.");
      return;
    }

    const header = `TRANSKRIP PERKULIAHAN\nMata Kuliah: ${sessionInfo?.courseName || "-"}\nKelas: ${sessionInfo?.classGroup || "-"}\nDosen: ${sessionInfo?.dosenName || "-"}\nTanggal: ${new Date().toLocaleDateString()}\n----------------------------------------\n\n`;
    const content = header + transkripsi.map(t => `[${t.waktu}] ${t.speaker}:\n${t.teks}\n`).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Transkrip-${sessionInfo?.courseName || "Kuliah"}-${sessionInfo?.classGroup || ""}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transkripsi]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [diskusi]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionInfo?.status === "completed" || !chatInput.trim() || !user || !id) return;
    
    const payload = { sessionId: id, userId: user.id, text: chatInput };
    try {
      const res = await fetch(`/api/dosen/sessions/${id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        socketRef.current?.emit("chat-message", { ...data.data, sessionId: id });
        setChatInput("");
      }
    } catch (e) {
      console.error("Gagal mengirim pesan diskusi:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <p className="text-gray-500 font-medium animate-pulse">Memverifikasi akses keamanan...</p>
      </div>
    );
  }

  if (forbiddenMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4f6] text-center px-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">403 Forbidden</h1>
        <p className="text-gray-500 max-w-md mb-8">{forbiddenMessage}</p>
        <Link to="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#f3f4f6] p-3 sm:p-6 font-sans relative flex flex-col">
      {/* Header Back Button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-gray-50 border border-gray-100 text-gray-600 transition-colors shrink-0">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {sessionInfo?.courseName || "Mata Kuliah"} {sessionInfo?.classGroup ? `(${sessionInfo.classGroup})` : ""}
              </h1>
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 text-white rounded-full text-[10px] font-bold tracking-wider ${sessionInfo?.status === "completed" ? "bg-gray-600" : "bg-red-600 animate-pulse"}`}>
                {sessionInfo?.status === "completed" ? "SELESAI" : "LIVE"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm font-semibold text-gray-500">
              <span>{sessionInfo?.dosenName || "Dosen Pengampu"}</span>
              <span>
                {sessionInfo?.startTime ? new Date(sessionInfo.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "10:00"}
                {" - "}
                {sessionInfo?.endTime ? new Date(sessionInfo.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Selesai"}
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>Topik: {sessionInfo?.title || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Status Ping Suara Dosen Real-time */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className={`flex items-center gap-[2px] ${sessionInfo?.status === "completed" ? "text-gray-400" : dosenStatus.online ? "text-purple-600" : "text-gray-400"}`}>
              <div className={`w-[3px] h-3 rounded-full ${sessionInfo?.status === "completed" ? "bg-gray-300" : dosenStatus.online ? "bg-purple-600" : "bg-gray-300"}`}></div>
              <div className={`w-[3px] h-5 rounded-full ${sessionInfo?.status === "completed" ? "bg-gray-300" : dosenStatus.online ? "bg-purple-600" : "bg-gray-300"}`}></div>
              <div className={`w-[3px] h-3 rounded-full ${sessionInfo?.status === "completed" ? "bg-gray-300" : dosenStatus.online ? "bg-purple-600" : "bg-gray-300"}`}></div>
              <div className={`w-[3px] h-4 rounded-full ${sessionInfo?.status === "completed" ? "bg-gray-300" : dosenStatus.online ? "bg-purple-600" : "bg-gray-300"}`}></div>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {sessionInfo?.status === "completed" ? "Sesi Selesai" : dosenStatus.online ? "Suara Dosen" : "Dosen Offline"}
            </span>
            <div className="flex items-end gap-[2px] h-4 ml-1">
              <div className={`w-1 rounded-t-sm h-1.5 ${sessionInfo?.status === "completed" ? "bg-gray-300" : dosenStatus.online ? "bg-green-500" : "bg-gray-300"}`}></div>
              <div className={`w-1 rounded-t-sm h-2.5 ${sessionInfo?.status === "completed" ? "bg-gray-300" : dosenStatus.online ? "bg-green-500" : "bg-gray-300"}`}></div>
              <div className={`w-1 rounded-t-sm h-3.5 ${sessionInfo?.status === "completed" ? "bg-gray-300" : dosenStatus.online ? "bg-green-500" : "bg-gray-300"}`}></div>
              <div className={`w-1 rounded-t-sm h-full ${sessionInfo?.status === "completed" ? "bg-gray-300" : dosenStatus.online ? "bg-green-500" : "bg-gray-300"}`}></div>
            </div>
          </div>

          {/* Jumlah Peserta Kelas */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm" title="Total Mahasiswa Terdaftar">
            <Users className="w-5 h-5 text-gray-800" />
            <span className="text-sm font-bold text-gray-900">
              {sessionInfo?.totalStudents || activeUserIds.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* PANEL KIRI: Transkripsi */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[400px] lg:h-auto min-h-0">
          <div className="p-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-purple-700">Transkripsi <span className="hidden md:inline text-gray-500 font-normal text-sm">{sessionInfo?.status === "completed" ? "rekaman sesi perkuliahan" : "berlangsung secara real time"}</span></h2>
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                sessionInfo?.status === "completed" 
                  ? "bg-gray-100 text-gray-600" 
                  : "bg-red-50 text-red-600"
              }`}>
                {sessionInfo?.status === "completed" ? (
                  <span>SELESAI</span>
                ) : (
                  <>
                    <CircleDot className="w-2.5 h-2.5 fill-red-600 animate-pulse" /> Live now
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input type="text" placeholder="Cari dalam transkripsi..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-purple-500" />
              </div>
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 scroll-smooth min-h-0 relative">
            {transkripsi.length === 0 ? (
              <div className="text-center text-gray-400 text-sm mt-10 py-4">
                Belum ada transkripsi berlangsung...
              </div>
            ) : (
              <div className="relative pl-6 space-y-5">
                {/* Continuous purple vertical timeline line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-purple-300"></div>

                {transkripsi.map((t, idx) => {
                  const isLatest = idx === transkripsi.length - 1;
                  const dosenDisplayName = sessionInfo?.dosenName || (t.speaker && t.speaker !== "Dosen" ? t.speaker : "Dr. Miftakhhurokmat");

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
                          <span className="text-sm font-bold text-gray-500 tracking-tight">{t.waktu}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            {dosenDisplayName}
                          </span>
                        </div>

                        {/* Transcript Body Text */}
                        <p className="text-sm text-gray-900 leading-relaxed mt-2">
                          {t.teks}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>

          {/* Audio Spectrum Real-time / Status Selesai di bawah transkrip */}
          <div className="h-16 lg:h-20 bg-white border-t border-gray-100 flex items-center justify-center px-4 overflow-hidden flex-shrink-0">
             {sessionInfo?.status === "completed" ? (
               <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                 <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                 <span>Sesi perkuliahan telah selesai</span>
               </div>
             ) : (
               <div className="flex items-end justify-center gap-1.5 h-10 w-full max-w-md">
                  {dosenAudioBars.map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 rounded-full transition-all duration-75 shrink-0 ${
                        !dosenStatus.online || !dosenAudioRecording
                          ? "h-1.5 bg-gray-300"
                          : !dosenAudioSpeaking
                          ? "h-1.5 bg-purple-300/60"
                          : h > 6
                          ? "bg-[#C084FC]"
                          : "h-1.5 bg-purple-300/60"
                      }`} 
                      style={{ 
                        height: (dosenStatus.online && dosenAudioRecording && dosenAudioSpeaking) 
                          ? `${h}px` 
                          : "6px" 
                      }}
                    />
                  ))}
               </div>
             )}
          </div>
        </div>

        {/* PANEL KANAN */}
        <div className="col-span-12 lg:col-span-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 min-h-0">
          
          {/* Middle Column: Diskusi & Ringkasan */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 lg:h-auto min-h-0">
            
{/* Ringkasan & Mindmap AI */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-0">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-purple-700 whitespace-nowrap text-xs">Insight Perkuliahan AI</h3>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
                  <button 
                    onClick={() => setSummaryTab("ringkasan")}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors text-[11px] ${summaryTab === "ringkasan" ? "bg-white text-purple-700 shadow-xs" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Ringkasan
                  </button>
                  <button 
                    onClick={() => setSummaryTab("mindmap")}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors text-[11px] ${summaryTab === "mindmap" ? "bg-white text-purple-700 shadow-xs" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Mindmap
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {summaryTab === "ringkasan" ? (
                  sessionInfo?.aiSummary ? (
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-xs">Rangkuman Sesi:</h4>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                        {sessionInfo.aiSummary}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-3 opacity-60">
                      <Sparkles className="w-8 h-8 text-purple-400 mb-2 animate-pulse" />
                      <p className="text-xs text-gray-600">
                        {sessionInfo?.status === "completed" 
                          ? "Ringkasan sedang diproses..." 
                          : "Ringkasan AI akan otomatis dihasilkan setelah dosen mengakhiri sesi."}
                      </p>
                    </div>
                  )
                ) : (
                  sessionInfo?.aiMindmapData ? (
                    (() => {
                      try {
                        const parsed = typeof sessionInfo.aiMindmapData === 'string' ? JSON.parse(sessionInfo.aiMindmapData) : sessionInfo.aiMindmapData;
                        return <MindmapView data={parsed} />;
                      } catch(e) {
                        return <p className="text-xs text-gray-400">Gagal memproses struktur mindmap.</p>;
                      }
                    })()
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-3 opacity-60">
                      <Sparkles className="w-8 h-8 text-purple-400 mb-2 animate-pulse" />
                      <p className="text-xs text-gray-600">
                        {sessionInfo?.status === "completed" 
                          ? "Mindmap sedang diproses..." 
                          : "Mindmap AI akan dibuat otomatis setelah sesi kuliah diakhiri."}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

{/* Diskusi Dosen */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-0">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-purple-700 whitespace-nowrap">Diskusi Dosen</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 min-h-0">
                {diskusi.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                    <p className="text-center text-xs text-gray-500">Belum ada diskusi, jadilah yang pertama bertanya!</p>
                  </div>
                ) : (
                  diskusi.map((d, i) => {
                    const isSelf = d.userId === user?.id;
                    const timeValue = d.timeSent || d.createdAt;
                    const timeString = timeValue 
                      ? new Date(timeValue).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) 
                      : '';
                    
                    return (
                      <div key={i} className={`flex flex-col w-full ${isSelf ? 'items-end' : 'items-start'}`}>
                        {/* Nama dan Jam */}
                        <div className="flex items-baseline gap-2 mb-1.5 px-1">
                          <span className="text-xs font-bold text-gray-900">{d.userName}</span>
                          <span className="text-[10px] font-medium text-gray-400 uppercase">{timeString}</span>
                        </div>
                        
                        {/* Chat Bubble */}
                        <div className={`px-4 py-2.5 max-w-[90%] sm:max-w-[80%] rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                          isSelf 
                            ? 'bg-purple-600 text-white rounded-tr-sm' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                        }`}>
                          {d.text}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              {sessionInfo?.status === "completed" ? (
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-2 flex-shrink-0 text-center">
                  <p className="text-xs text-gray-500 font-medium">Sesi perkuliahan telah selesai. Diskusi telah ditutup.</p>
                </div>
              ) : (
                <form onSubmit={sendChat} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tulis pertanyaan terkait materi..." 
                    className="flex-1 text-xs border border-gray-200 rounded-full px-4 py-2.5 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all" 
                  />
                  <button type="submit" disabled={!chatInput.trim()} className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50">
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              )}
            </div>

</div>

{/* Far Right: Materi PDF Viewer */}
          <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[500px] lg:h-auto min-h-0">
            {activePdf ? (
              <>
                {/* Header PDF */}
                <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50/50 gap-3 flex-shrink-0">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm truncate">{activePdf.name}</h3>
                      <p className="text-xs text-gray-400">{activePdf.size || "PDF Document"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {materiList.length > 1 && (
                      <select 
                        value={activePdf.id} 
                        onChange={(e) => {
                          const found = materiList.find(m => m.id === e.target.value);
                          if (found) setActivePdf(found);
                        }}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 outline-none"
                      >
                        {materiList.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    )}
                    <a 
                      href={activePdf.url} 
                      download={activePdf.name} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-lg border border-purple-200 bg-white transition-colors whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" /> <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Content PDF via Embed/Iframe */}
                <div className="flex-1 w-full h-full bg-gray-100 min-h-0 relative">
                  <iframe 
                    src={`${activePdf.url}#toolbar=1`} 
                    className="w-full h-full border-none rounded-b-2xl" 
                    title={activePdf.name}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                <div className="w-14 h-14 bg-purple-50 text-purple-400 rounded-2xl flex items-center justify-center mb-3">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Belum Ada Materi PDF</h4>
                <p className="text-xs text-gray-500 max-w-sm">
                  Dosen belum membagikan dokumen PDF perkuliahan pada sesi ini. Dokumen akan muncul otomatis saat dibagikan.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Static Bottom Toolbar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:gap-8 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm w-full mx-auto max-w-4xl">
        <button className="flex items-center gap-3 hover:bg-gray-50 px-4 py-2 rounded-xl border border-transparent hover:border-gray-100 transition-colors">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-purple-700 whitespace-nowrap">Bahasa</span>
            <span className="text-xs font-semibold text-purple-500 whitespace-nowrap">Indonesia</span>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-300 rotate-90 ml-2" />
        </button>

        <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

        {/* Section REC Berjalan Sesuai Waktu Sesi */}
        <div className="flex items-center gap-4 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${sessionInfo?.status === "completed" ? "bg-gray-200" : "bg-red-100"}`}>
              <div className={`rounded-full ${sessionInfo?.status === "completed" ? "w-2.5 h-2.5 bg-gray-500" : "w-3 h-3 bg-red-600 animate-pulse"}`}></div>
            </div>
            <div className="flex flex-col items-start">
              <span className={`text-xs font-bold leading-none whitespace-nowrap ${sessionInfo?.status === "completed" ? "text-gray-600" : "text-red-600"}`}>
                {sessionInfo?.status === "completed" ? "SELESAI" : "REC"}
              </span>
              <span className="text-[10px] text-gray-500 font-mono mt-0.5 whitespace-nowrap">{formatTime(sessionDuration)}</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

        {/* Tombol Download Transkrip: Hanya Aktif Saat Sesi Telah Selesai */}
        <button 
          onClick={downloadTranscript}
          disabled={sessionInfo?.status !== "completed"}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors ${
            sessionInfo?.status === "completed" 
              ? "hover:bg-purple-50 border-purple-200 cursor-pointer text-purple-700 bg-white shadow-xs" 
              : "opacity-40 cursor-not-allowed border-transparent text-gray-400"
          }`}
          title={sessionInfo?.status !== "completed" ? "Download hanya tersedia setelah sesi perkuliahan diakhiri" : "Download Transkrip (.txt)"}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${sessionInfo?.status === "completed" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}>
            <Download className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold leading-none whitespace-nowrap">Download</span>
            <span className="text-xs font-semibold mt-1 whitespace-nowrap">
              {sessionInfo?.status === "completed" ? "Transkrip (.txt)" : "Sesi Belum Selesai"}
            </span>
          </div>
        </button>
      </div>

    </div>
  );
}
