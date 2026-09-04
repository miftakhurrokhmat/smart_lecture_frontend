import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChart3, Clock, Users, Calendar, Download, RefreshCw, BookOpen } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

interface GrafikItem {
  nama: string;
  kehadiran: number;
}

interface MatkulStatItem {
  nama: string;
  kode: string;
  sesi: number;
  kehadiran: number;
  kelas: string;
}

interface ReportData {
  totalSesi: number;
  rataDurasi: string;
  totalMahasiswa: number;
  rataKehadiran: string;
  grafik: GrafikItem[];
  matkulStats: MatkulStatItem[];
}

export default function DosenLaporan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    totalSesi: 0,
    rataDurasi: "0 menit",
    totalMahasiswa: 0,
    rataKehadiran: "0%",
    grafik: [],
    matkulStats: [],
  });

  const fetchReports = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/dosen/reports?dosenId=${user.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReportData(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user?.id]);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="w-full px-4 py-6 lg:px-8 lg:py-8 flex flex-col gap-6 print:p-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Laporan & Analitik
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Ringkasan performa dan metrik perkuliahan {user?.name ? `untuk ${user.name}` : ""}.
            </p>
          </div>
          
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={fetchReports}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
            <span className="text-gray-500 text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" /> Total Sesi
            </span>
            <span className="text-3xl font-bold text-gray-900">
              {loading ? "-" : reportData.totalSesi}
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
            <span className="text-gray-500 text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Rata-rata Durasi
            </span>
            <span className="text-3xl font-bold text-blue-600">
              {loading ? "-" : reportData.rataDurasi}
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
            <span className="text-gray-500 text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" /> Total Mahasiswa
            </span>
            <span className="text-3xl font-bold text-purple-600">
              {loading ? "-" : reportData.totalMahasiswa}
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
            <span className="text-gray-500 text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-500" /> Kehadiran Total
            </span>
            <span className="text-3xl font-bold text-green-600">
              {loading ? "-" : reportData.rataKehadiran}
            </span>
          </div>
        </div>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Line Chart Tren */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Tren Kehadiran Sesi</h3>
              <span className="text-xs text-gray-500 font-medium">Sesi Terakhir</span>
            </div>
            
            {loading ? (
              <div className="h-[260px] sm:h-[300px] w-full flex items-center justify-center text-gray-400 text-sm">
                Memuat grafik kehadiran...
              </div>
            ) : reportData.grafik.length === 0 ? (
              <div className="h-[260px] sm:h-[300px] w-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
                Belum ada data riwayat sesi
              </div>
            ) : (
              <div className="h-[260px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.grafik} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="nama" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      domain={[0, 100]} 
                      unit="%" 
                    />
                    <Tooltip 
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      formatter={(val: any) => [`${val}%`, "Kehadiran"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="kehadiran" 
                      stroke="#9333ea" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#9333ea', strokeWidth: 0 }} 
                      activeDot={{ r: 7, fill: '#7e22ce' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Table Ringkasan per Mata Kuliah */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Ringkasan per Mata Kuliah</h3>
              <span className="text-xs text-gray-500 font-medium">
                {reportData.matkulStats.length} Mata Kuliah
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[360px]">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl">Mata Kuliah</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Jml Sesi</th>
                    <th className="px-4 py-3 rounded-tr-xl">Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        Memuat data mata kuliah...
                      </td>
                    </tr>
                  ) : reportData.matkulStats.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Belum ada mata kuliah yang diampu
                      </td>
                    </tr>
                  ) : (
                    reportData.matkulStats.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-gray-900">{m.nama}</div>
                          {m.kode && <div className="text-xs text-gray-400">{m.kode}</div>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                            {m.kelas || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 font-medium">
                          {m.sesi} sesi
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            m.kehadiran >= 85 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : m.kehadiran >= 70 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {m.kehadiran}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media print {
          aside, header, button, nav {
            display: none !important;
          }
          body, html, #root {
            overflow: visible !important;
            height: auto !important;
            background: white !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
