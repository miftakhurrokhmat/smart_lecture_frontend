import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Volume2,
  Search,
  SlidersHorizontal,
  Users,
  LogOut,
  Sparkles,
  MessageSquare,
  FileText,
  Minus,
  Plus,
  Maximize2,
  Send,
  Globe,
  Pause,
  Mic,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export default function CourseDetail() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("transkripsi");

  const tabs = [
    { id: "transkripsi", label: "Transkripsi", icon: Mic },
    { id: "preview", label: "Preview (Document)", icon: FileText },
    { id: "ringkasan", label: "Ringkasan", icon: Sparkles },
    { id: "diskusi", label: "Diskusi (Dosen)", icon: MessageSquare },
  ];

  const transcripts = Array.from({ length: 6 }).map(() => ({
    time: "10:15:32",
    role: "Dosen",
    text: "Selamat pagi semuanya. Pada pertemuan kali ini kita akan mengadakan sebuah technical zoom meeting dengan membahas kecerdasan buatan atau artificial intelligence di dalam kehidupan sehari-hari.",
  }));

  const ringkasanPoints = Array.from({ length: 6 }).map(
    () => "AI membantu manusia dalam menganalisis data dan mengenali pola",
  );

  const diskusi = [
    {
      name: "Minato",
      time: "09:25",
      role: "student",
      text: "Pak, apakah neural network termasuk dalam machine learning?",
    },
    {
      name: "Dosen",
      time: "09:25",
      role: "lecturer",
      text: "Ya betul, neural network adalah salah satu algoritma dalam machine learning yang terinspirasi dari cara kerja otak manusia.",
    },
    {
      name: "Minato",
      time: "09:25",
      role: "student",
      text: "Makasih pak",
    },
  ];

  // simple static waveform heights
  const waveform = [
    8, 14, 22, 30, 18, 10, 26, 34, 20, 12, 28, 36, 16, 22, 30, 14, 8, 20, 32,
    24, 12, 18, 28, 34, 16, 10, 22, 30, 18, 26, 14, 8, 20, 32, 24, 12, 18, 28,
    34, 16,
  ];

  return (
    <DashboardLayout>
      <div
        className="w-full"
        style={{
          backgroundImage: "url('/assets/bg-cover.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "local",
        }}
      >
        <div className="w-full px-4 py-6 pb-10 lg:px-8 lg:py-8 lg:pb-10 flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
                    Sistem Informasi (TI-3A)
                  </h1>
                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] lg:text-xs font-bold rounded-md tracking-wide">
                    LIVE
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Dr. Miftakhhurokmat</span>
                  <span className="text-gray-300">•</span>
                  <span>10.00 - 12.00</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-red-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />
                    00:32:40
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 lg:px-4 py-2">
                <Volume2 className="w-4 h-4 text-purple-600" />
                <span className="text-xs lg:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Suara Dosen
                </span>
                <div className="flex items-end gap-0.5 h-3">
                  {[3, 6, 4, 7, 5].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 bg-purple-500 rounded-full animate-pulse"
                      style={{
                        height: `${h}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 lg:px-4 py-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-xs lg:text-sm font-semibold text-gray-700">
                  40
                </span>
              </div>

              <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-full text-xs lg:text-sm transition-colors whitespace-nowrap">
                <LogOut className="w-4 h-4" />
                Keluar Sesi
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 bg-purple-50/70 border border-purple-100 rounded-2xl p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 lg:gap-2 px-3 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-colors truncate ${
                    activeTab === tab.id
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main content: kiri Transkripsi (full height), kanan PDF + (Ringkasan/Diskusi) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
            {/* LEFT: Transkripsi - tinggi penuh */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 flex flex-col gap-3 h-[480px] lg:h-full">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  Transkripsi berlangsung secara real time
                </p>
                <span className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />
                  Live now
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari dalam transkripsi..."
                    className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <button className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 pr-1">
                {transcripts.map((item, idx) => (
                  <div
                    key={idx}
                    className={`border-l-4 rounded-r-xl pl-4 py-3 ${
                      idx === 0
                        ? "border-purple-500 bg-purple-50"
                        : "border-purple-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-gray-500">
                        {item.time}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-semibold rounded">
                        {item.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 shrink-0">
                <div className="flex items-end gap-[2px] h-9">
                  {waveform.map((h, i) => (
                    <span
                      key={i}
                      className="w-3 bg-purple-300 rounded-full"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full inline-block" />
                  Transkripsi otomatis
                </p>
              </div>
            </div>

            {/* RIGHT: stacked PDF preview + (Ringkasan AI / Diskusi Dosen) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* PDF Preview Panel */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        Pengantar Sistem Informasi.pdf
                      </p>
                      <p className="text-xs text-gray-400">2.4 mb</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1.5">
                      <Minus className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                      <span className="text-xs text-gray-600 font-medium px-1">
                        100%
                      </span>
                      <Plus className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                    </div>
                    <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    <button className="hidden sm:block p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 h-[260px] lg:h-[280px]">
                  {/* Thumbnails */}
                  <div className="hidden sm:flex flex-col gap-2 overflow-y-auto w-16 shrink-0 pr-1">
                    {[1, 2, 3].map((p) => (
                      <div key={p} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-14 h-20 rounded-md border-2 bg-gray-50 ${
                            p === 1 ? "border-purple-500" : "border-gray-200"
                          }`}
                        />
                        <span
                          className={`text-[11px] font-medium px-1.5 rounded ${
                            p === 1
                              ? "bg-purple-100 text-purple-600"
                              : "text-gray-400"
                          }`}
                        >
                          {p}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Page content */}
                  <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the industry's
                      standard dummy text ever since the 1500s, when an unknown
                      printer took a galley of type and scrambled it to make a
                      type specimen book. It has survived not only many decades,
                      but also the leap into electronic typesetting, remaining
                      essentially unchanged. It was popularised in the 1960s
                      with the release of Letraset sheets containing Lorem Ipsum
                      passages, and more recently with desktop publishing
                      software like Aldus PageMaker including versions of Lorem
                      Ipsum.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
                  <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Halaman 1/24
                  </span>
                  <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ringkasan AI + Diskusi Dosen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Ringkasan AI */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-gray-900 text-base">
                      Ringkasan AI
                    </h3>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Poin Utama
                  </p>
                  <div className="flex flex-col gap-3 overflow-y-auto h-[350px] pr-1">
                    {ringkasanPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diskusi Dosen */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-gray-900 text-base">
                      Diskusi Dosen
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3 overflow-y-auto h-[350px] pr-1">
                    {diskusi.map((msg, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                            msg.role === "lecturer"
                              ? "bg-gradient-to-br from-blue-400 to-blue-600"
                              : "bg-gradient-to-br from-purple-400 to-purple-600"
                          }`}
                        >
                          {msg.name.charAt(0)}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl rounded-tl-none px-4 py-2.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {msg.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {msg.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <input
                      type="text"
                      placeholder="Tulis pertanyaan terkait materi..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    />
                    <button className="w-10 h-10 shrink-0 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center transition-colors">
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="bottom-4 mx-auto pb-5 w-[655px]">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            {/* Bahasa */}
            <button className="flex items-center gap-3 bg-white rounded-full pl-2 pr-4 py-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-bold text-purple-700">Bahasa</p>
                <p className="text-xs font-semibold text-purple-400">
                  Indonesia
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            </button>

            {/* REC */}
            <div className="flex items-center gap-3 bg-purple-50 rounded-full pl-2 pr-2 py-2 border border-purple-100">
              <div className="w-9 h-9 rounded-full border-2 border-red-200 flex items-center justify-center shrink-0">
                <span className="w-4 h-4 rounded-full bg-red-500" />
              </div>
              <div className="text-left leading-tight pr-1">
                <p className="text-sm font-bold text-red-500">REC</p>
                <p className="text-xs font-medium text-gray-400">00:32:45</p>
              </div>
              <button className="w-9 h-9 rounded-xl bg-white flex items-center justify-center gap-1 shadow-sm shrink-0 hover:bg-gray-50 transition-colors">
                <span className="w-1 h-3.5 bg-purple-600 rounded-sm" />
                <span className="w-1 h-3.5 bg-purple-600 rounded-sm" />
              </button>
            </div>

            {/* Download */}
            <button className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 rounded-full pl-2 pr-4 py-2 transition-colors">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-bold text-white">Download</p>
                <p className="text-xs font-medium text-purple-200">
                  Transkrip (.txt)
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
