import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { Clock, Users, BookOpen } from "lucide-react";

interface Course {
  id: string;
  name: string;
  instructor: string;
  icon: string;
  color: string;
  status?: "LIVE" | "Selesaiakses" | "Sedang diakses";
  time?: string;
  joinUrl?: string;
}

const COURSES: Course[] = [
  {
    id: "1",
    name: "Sistem Informasi (TI-3A)",
    instructor: "Dr. Miftakhurrokhmat",
    icon: "📋",
    color: "from-blue-400 to-blue-600",
    status: "LIVE",
    time: "08:00-10:00",
    joinUrl: "/course/1",
  },
  {
    id: "2",
    name: "Basis Data (TI-3A)",
    instructor: "Dr. Miftakhurrokhmat",
    icon: "💾",
    color: "from-green-400 to-green-600",
    status: "Selesaiakses",
    time: "10:20-12:00",
  },
  {
    id: "3",
    name: "Kecerdasan Buatan (TI-3A)",
    instructor: "Dr. Miftakhurrokhmat",
    icon: "🤖",
    color: "from-purple-400 to-purple-600",
    status: "Sedang diakses",
    time: "12:20-14:00",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("jadwal");

  return (
    <DashboardLayout currentUser={{ name: "Minato", email: "minato@smartlecture.com" }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Halo, Minato! 👋
          </h1>
          <p className="text-gray-600">
            Semangat belajar hari ini, jangan lupa fokus yah!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("jadwal")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "jadwal"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📓 Jadwal
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            ⏱️ History
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "events"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📅 Upcoming Event
          </button>
        </div>

        {/* Jadwal Tab Content */}
        {activeTab === "jadwal" && (
          <div className="space-y-4">
            {/* Sesi Hari Ini Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sesi Hari Ini
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {COURSES.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <span className="text-4xl">{course.icon}</span>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {course.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Dr. {course.instructor}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {course.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge and Action */}
                      <div className="flex flex-col items-end gap-3">
                        {course.status === "LIVE" && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                            LIVE
                          </span>
                        )}
                        {course.status === "Selesaiakses" && (
                          <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            Selesaiakses
                          </span>
                        )}
                        {course.status === "Sedang diakses" && (
                          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-medium">
                            Sedang diakses
                          </span>
                        )}

                        {course.status === "LIVE" && course.joinUrl && (
                          <Link
                            to={course.joinUrl}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-sm"
                          >
                            Masuk ke Sesi
                          </Link>
                        )}
                        {course.status !== "LIVE" && (
                          <button className="px-6 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg text-sm cursor-not-allowed">
                            Lihat Detail
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab Content */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Tidak ada riwayat pembelajaran saat ini</p>
          </div>
        )}

        {/* Events Tab Content */}
        {activeTab === "events" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Belum ada acara yang akan datang</p>
          </div>
        )}

        {/* Information Filter Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informasi Fitur</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: "Transkripsi", icon: "🎙️" },
              { label: "Diskusi Dosen", icon: "👥" },
              { label: "Ringkasan AI", icon: "🤖" },
              { label: "TTL & Akses", icon: "🎥" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <p className="text-sm font-medium text-gray-900">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Promo/Info Card */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="text-5xl">✨</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Belajar inklusif, setiap kata berarti.
              </h3>
              <p className="text-purple-100">
                Smart Lecture membantu Anda belajar lebih baik dengan transkripsi real-time, inggasan AI, dan diskusi bersama dosen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
