import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import {
  Clock,
  Calendar,
  Bell,
  Volume2,
  ChevronDown,
  Mic,
  MessageSquare,
  Sparkles,
  ClipboardList,
  Save,
  Bot,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
  id: string;
  name: string;
  instructor: string;
  icon: string;
  color: string;
  status?:
    | "LIVE"
    | "Selesaiakses"
    | "Sedang diakses"
    | "Selanjutnya"
    | "Akan datang";
  time?: string;
  joinUrl?: string;
}

interface Reminder {
  id: string;
  title: string;
  deadline: string;
  done: boolean;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("jadwal");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [ttsText, setTtsText] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "Kerjakan tugas Basis Data",
      deadline: "20 Mei 2024",
      done: false,
    },
    {
      id: "2",
      title: "Kerjakan tugas Basis Data",
      deadline: "20 Mei 2024",
      done: false,
    },
    {
      id: "3",
      title: "Kerjakan tugas Basis Data",
      deadline: "20 Mei 2024",
      done: false,
    },
  ]);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      if (data.success && data.courses) {
        const formattedCourses: Course[] = data.courses.map((course: any) => ({
          ...course,
          joinUrl:
            course.status === "LIVE" ? `/course/${course.id}` : undefined,
        }));
        setCourses(formattedCourses);
      } else {
        setError("Failed to load courses");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
    );
  };

  const getActionButton = (course: Course) => {
    if (course.status === "LIVE" && course.joinUrl) {
      return (
        <Link
          to={course.joinUrl}
          className="px-5 py-2.5 bg-purple-600 w-[192px] h-auto hover:bg-purple-700 text-white font-bold rounded-xl transition-colors text-sm whitespace-nowrap text-center"
        >
          Masuk ke Sesi
        </Link>
      );
    }
    return (
      <button className="px-5 py-2.5 border border-gray-200 w-[192px] h-auto text-gray-600 hover:bg-gray-50 font-medium rounded-xl text-sm whitespace-nowrap transition-colors">
        Lihat Detail
      </button>
    );
  };

  if (!user) return null;

  const tabs = [
    {
      id: "jadwal",
      label: "Jadwal",
      icon: <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />,
    },
    {
      id: "history",
      label: "History",
      icon: <Clock className="w-4 h-4 lg:w-5 lg:h-5" />,
    },
    {
      id: "events",
      label: "Upcoming Event",
      icon: <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />,
    },
  ];

  const features = [
    { label: "Transkripsi Live", sub: "Teks otomatis dari dosen", icon: Mic },
    {
      label: "Diskusi Dosen",
      sub: "Ajukan pertanyaan terkait materi",
      icon: MessageSquare,
    },
    {
      label: "Ringkasan AI",
      sub: "Ringkasan otomatis setelah sesi",
      icon: Sparkles,
    },
    {
      label: "TTS & Akses",
      sub: "Dengarkan dengan teknologi suara",
      icon: Volume2,
    },
  ];

  const courseIconMap: Record<string, React.ElementType> = {
    "📋": ClipboardList,
    "💾": Save,
    "🤖": Bot,
  };

  const getCourseIcon = (icon?: string) =>
    courseIconMap[icon ?? ""] ?? ClipboardList;

  const courseColors = [
    { bg: "bg-blue-100", text: "text-blue-600" },
    { bg: "bg-green-100", text: "text-green-600" },
    { bg: "bg-purple-100", text: "text-purple-600" },
  ];

  return (
    <DashboardLayout>
      <div
        className="min-h-full w-full"
        style={{
          backgroundImage: "url('/assets/bg-cover.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "local",
        }}
      >
        <div className="w-full px-4 py-6 pb-10 lg:px-8 lg:py-8 lg:pb-10 flex flex-col gap-6">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">
              Halo, {user.name}! 👋
            </h1>
            <p className="text-purple-600 font-semibold mt-1 text-sm lg:text-lg">
              Semangat belajar hari ini, jangan lupa tetap fokus ya!
            </p>
          </div>

          {/* 2-column layout */}
          <div className="flex gap-4 lg:gap-6 flex-col lg:flex-row items-start">
            {/* LEFT COLUMN */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* Tabs */}
              <div className="bg-white rounded-2xl border border-gray-200 p-1.5 flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 lg:gap-2 px-2 lg:px-5 py-2.5 lg:py-3 rounded-xl text-xs lg:text-base font-semibold transition-colors ${
                      activeTab === tab.id
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* JADWAL */}
              {activeTab === "jadwal" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base lg:text-lg font-bold text-gray-900">
                      Sesi Hari Ini
                    </h3>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-600 text-xs lg:text-sm font-semibold rounded-full">
                      {courses.length} Sesi
                    </span>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Course cards */}
                  <div className="flex flex-col gap-3">
                    {isLoading
                      ? [1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
                          >
                            <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                            <div className="h-4 bg-gray-100 rounded w-1/3" />
                          </div>
                        ))
                      : courses.map((course, index) => {
                          const courseColors = [
                            { bg: "bg-blue-100", text: "text-blue-600" },
                            { bg: "bg-green-100", text: "text-green-600" },
                            { bg: "bg-purple-100", text: "text-purple-600" },
                          ];
                          const color =
                            courseColors[index % courseColors.length];
                          const Icon = getCourseIcon(course.icon);

                          return (
                            <div
                              key={course.id}
                              className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5"
                            >
                              <div className="flex items-center gap-3 lg:gap-5">
                                <div className="relative shrink-0">
                                  {course.status === "LIVE" && (
                                    <span className="absolute -top-2 -left-2 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold">
                                      LIVE
                                    </span>
                                  )}
                                  <div
                                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center ${color.bg}`}
                                  >
                                    <Icon
                                      className={`w-6 h-6 lg:w-7 lg:h-7 ${color.text}`}
                                    />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 text-sm lg:text-base">
                                    {course.name}
                                  </h4>
                                  <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
                                    Dr. {course.instructor}
                                  </p>
                                  <p className="text-xs lg:text-sm text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {course.time}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  {course.status === "LIVE" && (
                                    <span className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />
                                      Live sekarang
                                    </span>
                                  )}
                                  {course.status === "Selanjutnya" && (
                                    <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold">
                                      Selanjutnya
                                    </span>
                                  )}
                                  {course.status === "Akan datang" && (
                                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                                      Akan datang
                                    </span>
                                  )}
                                  {getActionButton(course)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                  </div>

                  {/* Info banner */}
                  <div className="bg-purple-600 rounded-2xl p-4 lg:p-5 flex items-center gap-3 lg:gap-4">
                    <Lightbulb className="w-5 h-5 lg:w-6 lg:h-6 text-white shrink-0" />
                    <p className="text-white text-sm lg:text-base font-medium">
                      Transkrip & diskusi akan tersedia setelah kamu masuk ke
                      live.
                    </p>
                    <div className="ml-auto text-purple-300 text-xs shrink-0">
                      〰️〰️〰️
                    </div>
                  </div>

                  {/* Informasi Fitur */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-sm lg:text-base font-bold text-gray-900">
                        Informasi Fitur
                      </h3>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[11px] lg:text-xs font-medium rounded-full">
                        Fitur yang tersedia saat live session
                      </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                      {features.map((f) => {
                        const Icon = f.icon;
                        return (
                          <div
                            key={f.label}
                            className="bg-white rounded-2xl border border-gray-200 p-5 lg:p-8 flex flex-col items-center justify-center text-center min-h-[160px] lg:min-h-[200px]"
                          >
                            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-3 lg:mb-4">
                              <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-purple-600" />
                            </div>
                            <p className="text-sm lg:text-base font-bold text-gray-900">
                              {f.label}
                            </p>
                            <p className="text-xs lg:text-sm text-gray-400 mt-1.5 leading-snug">
                              {f.sub}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 text-base">
                    Tidak ada riwayat pembelajaran saat ini
                  </p>
                </div>
              )}

              {activeTab === "events" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 text-base">
                    Belum ada acara yang akan datang
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full lg:w-[354px] shrink-0 flex flex-col gap-4">
              {/* TTS Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 text-base">
                  Ucapkan (TTS)
                </h3>
                <p className="text-sm text-gray-400 mt-1 mb-3">
                  Ubah teks menjadi suara untuk berbicara
                </p>
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  maxLength={300}
                  placeholder="Tulis pesan anda disini..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:border-purple-400 h-28"
                />
                <p className="text-right text-xs text-gray-300 mb-3">
                  {ttsText.length}/300
                </p>
                <div className="border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-50">
                  <Volume2 className="w-5 h-5 text-purple-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Suara Perempuan
                    </p>
                    <p className="text-xs text-gray-400">Indonesia</p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-base flex items-center justify-center gap-2 transition-colors">
                  <Volume2 className="w-5 h-5" />
                  Ucapkan
                </button>
              </div>

              {/* Pengingat Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900 text-base">
                    Pengingat
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {reminders.map((r) => (
                    <div key={r.id} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={r.done}
                        onChange={() => toggleReminder(r.id)}
                        className="mt-0.5 accent-purple-600 cursor-pointer w-4 h-4 shrink-0"
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${r.done ? "line-through text-gray-400" : "text-gray-900"}`}
                        >
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Deadline: {r.deadline}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Promo Card */}
              <div className="rounded-2xl overflow-hidden w-full h-48 sm:h-50 lg:h-50">
                <img
                  src="/assets/info.png"
                  alt="Belajar inklusif, setiap kata berarti"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
