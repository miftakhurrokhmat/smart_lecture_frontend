import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  X, 
  BookOpen, 
  Layers,
  MessageCircle,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Author {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface ReplyItem {
  id: string;
  text: string;
  timeSent: string;
  author: Author;
}

interface DiscussionThread {
  id: string;
  title: string;
  text: string;
  isAnswered: boolean;
  timeSent: string;
  createdAt?: string;
  author: Author;
  session: {
    id: string;
    title: string;
    status: string;
    classGroup: string;
  };
  course: {
    id: string;
    name: string;
    code: string;
  };
  repliesCount: number;
  replies: ReplyItem[];
}

interface CourseOption {
  courseId: string;
  courseName: string;
  courseCode: string;
  sessions: {
    sessionId: string;
    title: string;
    classGroup: string;
    status: string;
    startTime: string | null;
  }[];
}

interface DiskusiForumProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export function DiskusiForum({ 
  pageTitle = "Diskusi & Tanya Jawab",
  pageSubtitle = "Wadah diskusi materi perkuliahan antar dosen dan mahasiswa."
}: DiskusiForumProps) {
  const { user } = useAuth();

  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [options, setOptions] = useState<CourseOption[]>([]);
  const [allCourses, setAllCourses] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState<"semua" | "saya" | "belum" | "sudah">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("semua");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalCourseId, setModalCourseId] = useState("");
  const [modalSessionId, setModalSessionId] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalText, setModalText] = useState("");
  const [modalError, setModalError] = useState("");
  const [submittingModal, setSubmittingModal] = useState(false);

  // Replies State
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setRefreshing(true);
      const [threadsRes, optionsRes] = await Promise.all([
        fetch("/api/discussions"),
        fetch(`/api/discussions/options?userId=${user.id}&role=${user.role}`)
      ]);

      const threadsJson = await threadsRes.json();
      const optionsJson = await optionsRes.json();

      if (threadsJson.success && threadsJson.data) {
        setThreads(threadsJson.data);
      }
      if (optionsJson.success) {
        setOptions(optionsJson.data || []);
        setAllCourses(optionsJson.allCourses || []);
      }
    } catch (err) {
      console.error("Gagal memuat data diskusi:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, user?.role]);

  const toggleExpand = (threadId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }));
  };

  const handleOpenModal = () => {
    setModalError("");
    setModalCourseId(options.length > 0 ? options[0].courseId : "");
    const firstCourseSessions = options.length > 0 ? options[0].sessions : [];
    setModalSessionId(firstCourseSessions.length > 0 ? firstCourseSessions[0].sessionId : "");
    setModalTitle("");
    setModalText("");
    setShowModal(true);
  };

  const handleCourseChange = (courseId: string) => {
    setModalCourseId(courseId);
    const selectedCourse = options.find(c => c.courseId === courseId);
    if (selectedCourse && selectedCourse.sessions.length > 0) {
      setModalSessionId(selectedCourse.sessions[0].sessionId);
    } else {
      setModalSessionId("");
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCourseId) {
      setModalError("Pilih mata kuliah terlebih dahulu.");
      return;
    }
    if (!modalSessionId) {
      setModalError("Pilih sesi yang telah berjalan atau selesai untuk dibahas.");
      return;
    }
    if (!modalTitle.trim()) {
      setModalError("Judul topik bahasan wajib diisi.");
      return;
    }
    if (!modalText.trim()) {
      setModalError("Detail pertanyaan atau bahasan wajib diisi.");
      return;
    }

    try {
      setSubmittingModal(true);
      setModalError("");
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          sessionId: modalSessionId,
          title: modalTitle.trim(),
          text: modalText.trim(),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setThreads(prev => [json.data, ...prev]);
        setShowModal(false);
        setModalTitle("");
        setModalText("");
        setExpandedThreads(prev => ({ ...prev, [json.data.id]: true }));
      } else {
        setModalError(json.message || "Gagal membuat diskusi baru.");
      }
    } catch (err) {
      console.error("Error creating discussion:", err);
      setModalError("Terjadi kendala jaringan saat membuat diskusi.");
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleSendReply = async (threadId: string) => {
    const text = replyInputs[threadId]?.trim();
    if (!text || !user?.id) return;

    try {
      setSubmittingReply(prev => ({ ...prev, [threadId]: true }));
      const res = await fetch(`/api/discussions/${threadId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          text,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setThreads(prev =>
          prev.map(t => {
            if (t.id === threadId) {
              return {
                ...t,
                isAnswered: true,
                repliesCount: t.repliesCount + 1,
                replies: [...t.replies, json.data],
              };
            }
            return t;
          })
        );
        setReplyInputs(prev => ({ ...prev, [threadId]: "" }));
        setExpandedThreads(prev => ({ ...prev, [threadId]: true }));
      }
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setSubmittingReply(prev => ({ ...prev, [threadId]: false }));
    }
  };

  // Helper date formatter
  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeStr;
    }
  };

  const isMahasiswa = user?.role === "mahasiswa";
  const myThreadsCount = threads.filter(t => t.author.id === user?.id).length;

  // Filtered threads
  const filteredThreads = threads.filter(t => {
    // Role specific tab filter
    if (isMahasiswa) {
      if (activeFilter === "saya" && t.author.id !== user?.id) return false;
    } else {
      if (activeFilter === "belum" && t.isAnswered) return false;
      if (activeFilter === "sudah" && !t.isAnswered) return false;
    }

    // Course filter
    if (selectedCourseFilter !== "semua" && t.course.id !== selectedCourseFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchText = t.text.toLowerCase().includes(q);
      const matchAuthor = t.author.name.toLowerCase().includes(q);
      const matchCourse = t.course.name.toLowerCase().includes(q);
      const matchSession = t.session.title.toLowerCase().includes(q);
      return matchTitle || matchText || matchAuthor || matchCourse || matchSession;
    }

    return true;
  });

  const selectedCourseData = options.find(c => c.courseId === modalCourseId);
  const modalAvailableSessions = selectedCourseData ? selectedCourseData.sessions : [];

  const belumDijawabCount = threads.filter(t => !t.isAnswered).length;

  return (
    <div className="w-full px-4 py-6 lg:px-8 lg:py-8 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            {pageTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            title="Perbarui Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenModal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buat Diskusi Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari topik, pertanyaan, mahasiswa, atau mata kuliah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Mata Kuliah:</label>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 font-medium"
          >
            <option value="semua">Semua Mata Kuliah</option>
            {(allCourses.length > 0
              ? allCourses
              : options.map(opt => ({ id: opt.courseId, name: opt.courseName, code: opt.courseCode }))
            ).map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-none">
        {isMahasiswa ? (
          <>
            <button
              onClick={() => setActiveFilter("semua")}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeFilter === "semua"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Semua Topik Diskusi ({threads.length})
            </button>
            <button
              onClick={() => setActiveFilter("saya")}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeFilter === "saya"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Diskusi Saya
              {myThreadsCount > 0 && (
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {myThreadsCount}
                </span>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveFilter("semua")}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeFilter === "semua"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Semua Diskusi ({threads.length})
            </button>
            <button
              onClick={() => setActiveFilter("belum")}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeFilter === "belum"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Belum Dijawab
              {belumDijawabCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {belumDijawabCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter("sudah")}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeFilter === "sudah"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Sudah Dijawab ({threads.filter(t => t.isAnswered).length})
            </button>
          </>
        )}
      </div>

      {/* Discussion List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
            Memuat daftar diskusi...
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 flex flex-col items-center">
            <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              {activeFilter === "saya" ? "Belum Ada Diskusi yang Anda Ajukan" : "Belum Ada Diskusi"}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              {activeFilter === "saya"
                ? "Anda belum pernah mengajukan topik diskusi. Klik tombol di bawah untuk membuat diskusi pertama Anda."
                : "Tidak ditemukan topik diskusi pada kategori ini. Silakan buat diskusi baru untuk memulai."}
            </p>
            <button
              onClick={handleOpenModal}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat Diskusi Sekarang
            </button>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isExpanded = !!expandedThreads[thread.id];
            const isDosen = thread.author.role === "dosen";
            const replyInputText = replyInputs[thread.id] || "";
            const isReplyingCurrent = submittingReply[thread.id] || false;

            return (
              <div
                key={thread.id}
                className={`bg-white rounded-2xl border transition-all ${
                  thread.isAnswered ? "border-gray-200" : "border-amber-200"
                } p-5 flex flex-col gap-4 shadow-sm hover:shadow`}
              >
                {/* Header Card: Author, Badge, Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        isDosen
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {thread.author.name ? thread.author.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{thread.author.name}</span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isDosen
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {isDosen ? "Dosen" : "Mahasiswa"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(thread.timeSent)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div className="flex items-center gap-2">
                    {thread.isAnswered ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Dijawab
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Belum Dijawab
                      </span>
                    )}
                  </div>
                </div>

                {/* Course & Session Badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-medium">
                    <BookOpen className="w-3 h-3 text-gray-500" />
                    {thread.course.name} ({thread.course.code})
                  </span>
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg font-medium border border-purple-100">
                    <Layers className="w-3 h-3 text-purple-500" />
                    Topik: {thread.session.title}
                  </span>
                  {thread.session.classGroup && thread.session.classGroup !== "-" && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono text-[11px]">
                      Kelas {thread.session.classGroup}
                    </span>
                  )}
                </div>

                {/* Discussion Title and Detail */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                  <h3 className="font-bold text-gray-900 text-base">{thread.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {thread.text}
                  </p>
                </div>

                {/* Footer Action: View / Toggle Replies */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => toggleExpand(thread.id)}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {thread.repliesCount > 0
                        ? `${thread.repliesCount} Balasan`
                        : "Belum ada balasan"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (!isExpanded) toggleExpand(thread.id);
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-purple-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-purple-200 bg-white transition-colors"
                  >
                    Tulis Balasan
                  </button>
                </div>

                {/* Expanded Thread Section (Replies + Reply Input) */}
                {isExpanded && (
                  <div className="border-t border-gray-100 pt-4 flex flex-col gap-4 mt-1">
                    {/* List of Replies */}
                    {thread.replies && thread.replies.length > 0 && (
                      <div className="flex flex-col gap-3 pl-2 sm:pl-4 border-l-2 border-purple-100">
                        {thread.replies.map((reply) => {
                          const isReplierDosen = reply.author.role === "dosen";
                          return (
                            <div
                              key={reply.id}
                              className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 flex flex-col gap-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                      isReplierDosen
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {reply.author.name ? reply.author.name.charAt(0).toUpperCase() : "U"}
                                  </div>
                                  <span className="font-semibold text-gray-900 text-xs">
                                    {reply.author.name}
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                                      isReplierDosen
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {isReplierDosen ? "Dosen" : "Mahasiswa"}
                                  </span>
                                </div>
                                <span className="text-[11px] text-gray-400">
                                  {formatTime(reply.timeSent)}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm pl-8 leading-relaxed whitespace-pre-wrap">
                                {reply.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Input Reply */}
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={replyInputText}
                          onChange={(e) =>
                            setReplyInputs(prev => ({ ...prev, [thread.id]: e.target.value }))
                          }
                          placeholder={`Tulis balasan sebagai ${user?.name || "pengguna"}...`}
                          className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white resize-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSendReply(thread.id)}
                          disabled={!replyInputText.trim() || isReplyingCurrent}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {isReplyingCurrent ? "Mengirim..." : "Kirim Balasan"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Buat Diskusi Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Buat Diskusi Baru</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateDiscussion} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
              
              {modalError && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
                  {modalError}
                </div>
              )}

              {/* Selection 1: Mata Kuliah */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Pilih Mata Kuliah {isMahasiswa ? "(Kelas Anda)" : ""} *
                </label>
                {options.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-1">
                    <span className="font-bold">Tidak ada mata kuliah kelas yang tersedia</span>
                    <span className="text-amber-700 leading-relaxed">
                      {isMahasiswa
                        ? "Anda belum terdaftar di kelas manapun atau belum ada sesi perkuliahan yang berjalan/selesai untuk kelas Anda. Anda hanya dapat mengajukan diskusi pada mata kuliah yang ditugaskan ke kelas Anda."
                        : "Belum ada mata kuliah yang Anda ampu dengan sesi berjalan atau selesai."}
                    </span>
                  </div>
                ) : (
                  <>
                    <select
                      value={modalCourseId}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      required
                    >
                      <option value="" disabled>-- Pilih Mata Kuliah --</option>
                      {options.map((course) => (
                        <option key={course.courseId} value={course.courseId}>
                          {course.courseName} ({course.courseCode})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {isMahasiswa 
                        ? "Hanya menampilkan mata kuliah yang ditugaskan ke kelas Anda." 
                        : "Hanya menampilkan mata kuliah yang Anda ampu."}
                    </p>
                  </>
                )}
              </div>

              {/* Selection 2: Topik Sesi yang sudah berjalan/selesai */}
              {options.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Topik / Sesi Perkuliahan (Berjalan / Selesai) *
                  </label>
                  {modalAvailableSessions.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      Belum ada sesi yang berstatus berjalan atau selesai untuk mata kuliah kelas ini.
                    </div>
                  ) : (
                    <select
                      value={modalSessionId}
                      onChange={(e) => setModalSessionId(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      required
                    >
                      <option value="" disabled>-- Pilih Sesi --</option>
                      {modalAvailableSessions.map((session) => (
                        <option key={session.sessionId} value={session.sessionId}>
                          [{session.status === "live" ? "Sedang Berjalan" : "Selesai"}] {session.title} {session.classGroup ? `(Kelas ${session.classGroup})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {isMahasiswa 
                      ? "Hanya sesi perkuliahan berjalan atau selesai pada kelas Anda." 
                      : "Pilihan hanya mencakup sesi yang sedang berjalan atau sudah selesai."}
                  </p>
                </div>
              )}

              {/* Input 3: Judul Diskusi */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Judul Topik Bahasan *
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="Contoh: Pertanyaan tentang normalisasi BCNF"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  required
                />
              </div>

              {/* Textarea 4: Detail Bahasan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Detail yang Ingin Dibahas / Pertanyaan *
                </label>
                <textarea
                  rows={4}
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder="Tuliskan pertanyaan atau detail bahasan Anda secara lengkap..."
                  className="w-full p-3.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none"
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingModal || modalAvailableSessions.length === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingModal ? "Mengirim..." : "Kirim Diskusi"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
