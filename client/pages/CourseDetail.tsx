import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Settings, Volume2 } from "lucide-react";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("transkripsi");

  return (
    <DashboardLayout currentUser={{ name: "Minato", email: "minato@smartlecture.com" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sistem Informasi (TI-3A)
            </h1>
            <p className="text-gray-600 mt-1">08:00 - 10:00</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lecture Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="bg-black rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎥</div>
                <p className="text-gray-300">Video Lecture</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 bg-white rounded-lg p-2">
              {[
                { id: "transkripsi", label: "🎙️ Transkripsi" },
                { id: "preview", label: "📄 Preview (Document)" },
                { id: "ringkasan", label: "⚡ Ringkasan AI" },
                { id: "diskusi", label: "👥 Diskusi Dosen" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg p-6 space-y-4">
              {activeTab === "transkripsi" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>⏱️</span>
                    <span>10:15:32</span>
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                      Ready
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        time: "10:15:32",
                        text: "Selamat pagi semuanya. Pada pertemuan kali ini kita akan membahas tentang teknik-teknik database beserta schema normalization di dalamnya juga akan membahaskan konsep lainnya untuk memahami tentang konsep lainnya untuk memahami tentang database dan schema design...",
                      },
                      {
                        time: "10:32:12",
                        text: "Selamat pagi semuanya. Pada pertemuan kali ini kita akan membahas tentang teknik-teknik database beserta schema normalization di dalamnya juga akan membahaskan konsep lainnya untuk memahami tentang konsep lainnya untuk memahami tentang database dan schema design...",
                      },
                      {
                        time: "10:35:31",
                        text: "Selamat pagi semuanya. Pada pertemuan kali ini kita akan membahas tentang teknik-teknik database beserta schema normalization di dalamnya juga akan membahaskan konsep lainnya untuk memahami tentang konsep lainnya untuk memahami tentang database dan schema design...",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="border-l-4 border-purple-300 pl-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Volume2 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-mono text-gray-600">
                            {item.time}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                            Ready
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "preview" && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="text-5xl mb-4">📄</div>
                    <p className="text-gray-600">Document preview will appear here</p>
                  </div>
                </div>
              )}

              {activeTab === "ringkasan" && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-3">
                      AI Summary
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                      <li>
                        Pembahasan tentang teknik-teknik database dan schema normalization
                      </li>
                      <li>
                        Konsep penting dalam database design dan implementation
                      </li>
                      <li>
                        Best practices untuk mengoptimalkan performa database
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "diskusi" && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="text-5xl mb-4">👥</div>
                    <p className="text-gray-600">Diskusi dengan dosen akan dimulai setelah sesi</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Side Info */}
          <div className="space-y-4">
            {/* Upacakan (TTS) */}
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Upacakan (TTS)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ubah teks ini menjadi suara untuk membantu pembelajaran
              </p>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Suara Perempuan</option>
                <option>Suara Laki-laki</option>
              </select>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
                🔊 Upakakankan
              </button>
            </div>

            {/* Pengingat */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔔</span>
                <h3 className="font-semibold text-gray-900">Pengingat</h3>
              </div>
              <div className="space-y-2">
                {[
                  "Kerjakan tugas Basis Data",
                  "Kerjakan tugas Basis Data",
                  "Kerjakan tugas Basis Data",
                ].map((reminder, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{reminder}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
