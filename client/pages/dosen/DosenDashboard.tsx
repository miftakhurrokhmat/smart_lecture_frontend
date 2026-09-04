import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import {
  Clock,
  Calendar,
  ClipboardList,
  Save,
  Bot,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { PengingatSection } from "@/components/PengingatSection";
import { TtsCard } from "@/components/TtsCard";

interface Course {
  id: string;
  name: string;
  instructor: string;
  icon: string;
  color: string;
  status?:
    | "LIVE"
    | "Selesai"
    | "Selesaiakses"
    | "Sedang diakses"
    | "Selanjutnya"
    | "Akan datang";
  rawStatus?: string;
  startTime?: string | Date;
  time?: string;
  joinUrl?: string;
  code?: string;
  classGroup?: string;
}

export default function DosenDashboard() {
  const [activeTab, setActiveTab] = useState("jadwal");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboard();

      // Realtime listener saat ada sesi yang dimulai atau diakhiri
      const socket = io();
      socket.on("session-ended", () => {
        fetchDashboard();
      });
      socket.on("session-started", () => {
        fetchDashboard();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      // Di beranda dosen hanya tampil sesi yang diampu dosen tsb
      const response = await fetch(`/api/dashboard?userId=${user?.id}&role=dosen`);
      const data = await response.json();
      if (data.success && data.courses) {
        setCourses(data.courses);
      } else {
        setError("Gagal memuat jadwal sesi");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const getActionButton = (course: Course) => {
    if (course.status === "LIVE") {
      return (
        <Link
          to={`/dosen/sesi/${course.id}`}
          className="px-5 py-2.5 bg-purple-600 w-full sm:w-[192px] h-auto hover:bg-purple-700 text-white font-bold rounded-xl transition-colors text-sm whitespace-nowrap text-center shadow-xs"
        >
          Masuk ke Sesi
        </Link>
      );
    }
    if (course.status === "Selesai") {
      return (
        <Link
          to={`/dosen/sesi/${course.id}`}
          className="px-5 py-2.5 bg-purple-50 border border-purple-200 w-full sm:w-[192px] h-auto text-purple-700 hover:bg-purple-100 font-bold rounded-xl text-sm whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>Lihat Detail Sesi</span>
        </Link>
      );
    }
    return (
      <Link
        to={`/dosen/sesi/${course.id}`}
        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 shadow-xs w-full sm:w-[192px]"
      >
        Mulai Sesi
      </Link>
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

  const getCourseIcon = (_icon?: string) => ClipboardList;

  const courseColors = [
    { bg: "bg-blue-100", text: "text-blue-600" },
    { bg: "bg-green-100", text: "text-green-600" },
    { bg: "bg-purple-100", text: "text-purple-600" },
  ];

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();
  const endOfToday = new Date(todayYear, todayMonth, todayDate, 23, 59, 59, 999).getTime();

  // 1. Tab Jadwal: Sesi yang ada di hari saat itu saja (+ LIVE)
  const jadwalHariIni = courses.filter((c) => {
    if (c.status === "LIVE") return true;
    if (!c.startTime) return false;
    const d = new Date(c.startTime);
    return (
      d.getFullYear() === todayYear &&
      d.getMonth() === todayMonth &&
      d.getDate() === todayDate
    );
  });

  // 2. Tab History: Riwayat sesi yang sudah selesai di hari saat ini atau hari-hari sebelumnya
  const historySessions = courses.filter((c) => {
    const isFinished = c.status === "Selesai" || c.rawStatus === "completed";
    if (!isFinished) return false;
    if (!c.startTime) return true;
    return new Date(c.startTime).getTime() <= endOfToday;
  });

  // 3. Tab Upcoming Event: Sesi yang ada di tanggal berikutnya (besok dan seterusnya)
  const upcomingSessions = courses.filter((c) => {
    if (c.status === "Selesai" || c.rawStatus === "completed") return false;
    if (!c.startTime) return false;
    return new Date(c.startTime).getTime() > endOfToday;
  });

  const renderCourseCard = (course: Course, index: number) => {
    const color = courseColors[index % courseColors.length];
    const Icon = getCourseIcon(course.icon);

    return (
      <div
        key={course.id}
        className="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 lg:gap-5 min-w-0">
            <div className="relative shrink-0">
              {course.status === "LIVE" && (
                <span className="absolute -top-2 -left-2 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold">
                  LIVE
                </span>
              )}
              {course.status === "Selesai" && (
                <span className="absolute -top-2 -left-2 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-600 text-white text-[10px] font-bold">
                  SELESAI
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
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-gray-900 text-sm lg:text-base">
                  {course.name}
                </h4>
                {course.classGroup && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">
                    Kelas {course.classGroup}
                  </span>
                )}
              </div>
              <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
                Dosen Pengampu: {course.instructor}
              </p>
              <p className="text-xs lg:text-sm text-gray-400 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.time}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
            {course.status === "LIVE" && (
              <span className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />
                Live sekarang
              </span>
            )}
            {course.status === "Selesai" && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sesi Selesai
              </span>
            )}
            {course.status === "Selanjutnya" && (
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold self-start sm:self-end">
                Selanjutnya
              </span>
            )}
            {course.status === "Akan datang" && (
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium self-start sm:self-end">
                Akan datang
              </span>
            )}
            {getActionButton(course)}
          </div>
        </div>
      </div>
    );
  };

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
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">
                Halo, {user.name}!
              </h1>
              <p className="text-purple-600 font-semibold mt-1 text-sm lg:text-lg">
                Semangat mengajar hari ini, pastikan materi dan sesi sudah siap!
              </p>
            </div>
            <Link
              to="/dosen/jadwal"
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-xs text-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              Kelola / Buat Sesi
            </Link>
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
                    className={`flex-1 flex items-center justify-center gap-1.5 lg:gap-2 px-2 lg:px-5 py-2.5 lg:py-3 rounded-xl text-xs lg:text-base font-semibold transition-colors cursor-pointer ${
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
                      Sesi Mengajar Hari Ini
                    </h3>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-600 text-xs lg:text-sm font-semibold rounded-full">
                      {jadwalHariIni.length} Sesi
                    </span>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Course cards */}
                  <div className="flex flex-col gap-3">
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
                        >
                          <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                          <div className="h-4 bg-gray-100 rounded w-1/3" />
                        </div>
                      ))
                    ) : jadwalHariIni.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-base">
                          Belum ada sesi mengajar hari ini.
                        </p>
                      </div>
                    ) : (
                      jadwalHariIni.map((course, index) => renderCourseCard(course, index))
                    )}
                  </div>
                </div>
              )}

              {/* HISTORY */}
              {activeTab === "history" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base lg:text-lg font-bold text-gray-900">
                      Riwayat Sesi Mengajar
                    </h3>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-600 text-xs lg:text-sm font-semibold rounded-full">
                      {historySessions.length} Sesi Selesai
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
                        >
                          <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                          <div className="h-4 bg-gray-100 rounded w-1/3" />
                        </div>
                      ))
                    ) : historySessions.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-base">
                          Belum ada riwayat sesi yang selesai.
                        </p>
                      </div>
                    ) : (
                      historySessions.map((course, index) => renderCourseCard(course, index))
                    )}
                  </div>
                </div>
              )}

              {/* UPCOMING EVENTS */}
              {activeTab === "events" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base lg:text-lg font-bold text-gray-900">
                      Sesi Mengajar Mendatang
                    </h3>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-600 text-xs lg:text-sm font-semibold rounded-full">
                      {upcomingSessions.length} Sesi Mendatang
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
                        >
                          <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                          <div className="h-4 bg-gray-100 rounded w-1/3" />
                        </div>
                      ))
                    ) : upcomingSessions.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-base">
                          Belum ada sesi di tanggal berikutnya.
                        </p>
                      </div>
                    ) : (
                      upcomingSessions.map((course, index) => renderCourseCard(course, index))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full lg:w-[354px] shrink-0 flex flex-col gap-4">
              {/* TTS Card */}
              <TtsCard />

              {/* Pengingat Section */}
              <PengingatSection />

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
