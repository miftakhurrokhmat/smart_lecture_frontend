import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, Search, Filter, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface StudentData {
  id: string;
  nim: string;
  nama: string;
  kelas: string;
  prodi: string;
  email: string;
  matkul: string[];
  kehadiran: number;
}

export default function DosenMahasiswa() {
  const { user } = useAuth();
  const [mahasiswa, setMahasiswa] = useState<StudentData[]>([]);
  const [coursesList, setCoursesList] = useState<string[]>([]);
  const [kelasList, setKelasList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatkul, setSelectedMatkul] = useState("Semua");
  const [selectedKelas, setSelectedKelas] = useState("Semua");

  const fetchMahasiswa = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/dosen/students?dosenId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMahasiswa(data.data || []);
        setCoursesList(data.courses || []);
        setKelasList(data.classes || []);
      }
    } catch (e) {
      console.error("Gagal mengambil data mahasiswa dosen:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMahasiswa();
  }, [user?.id]);

  const filteredMahasiswa = mahasiswa.filter(m => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      m.nama.toLowerCase().includes(term) || 
      m.nim.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.prodi.toLowerCase().includes(term) ||
      m.kelas.toLowerCase().includes(term);

    const matchMatkul = 
      selectedMatkul === "Semua" || 
      (Array.isArray(m.matkul) ? m.matkul.includes(selectedMatkul) : m.matkul === selectedMatkul);

    const matchKelas = 
      selectedKelas === "Semua" || 
      m.kelas.toLowerCase() === selectedKelas.toLowerCase();

    return matchSearch && matchMatkul && matchKelas;
  });

  const avgKehadiran = mahasiswa.length > 0
    ? Math.round(mahasiswa.reduce((acc, curr) => acc + (curr.kehadiran || 0), 0) / mahasiswa.length)
    : 0;

  const handleExportCSV = () => {
    if (filteredMahasiswa.length === 0) return;
    const headers = ["NIM", "Nama Mahasiswa", "Kelas", "Program Studi", "Email", "Kehadiran (%)"];
    const rows = filteredMahasiswa.map(m => [
      `"${m.nim}"`,
      `"${m.nama}"`,
      `"${m.kelas}"`,
      `"${m.prodi}"`,
      `"${m.email}"`,
      `"${m.kehadiran}%"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daftar_mahasiswa_${user?.name?.replace(/\s+/g, "_") || "dosen"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="w-full px-4 py-6 lg:px-8 lg:py-8 flex flex-col gap-6 max-w-7xl mx-auto">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Daftar Mahasiswa
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Mahasiswa yang terdaftar pada kelas dan mata kuliah yang Anda ampu.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-col shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Mahasiswa</span>
              <span className="text-lg font-bold text-gray-900">
                {mahasiswa.length} <span className="text-sm font-medium text-gray-500">Orang</span>
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-col shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Kelas</span>
              <span className="text-lg font-bold text-purple-600">
                {kelasList.length} <span className="text-sm font-medium text-gray-500">Kelas</span>
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-col shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400">Rata-rata Kehadiran</span>
              <span className="text-lg font-bold text-green-600">{avgKehadiran}%</span>
            </div>
          </div>
        </div>

        {/* Toolbar Filter & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama, NIM, kelas, atau prodi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter Matkul */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[140px]">
              <Filter className="w-4 h-4 text-gray-500 shrink-0" />
              <select 
                value={selectedMatkul}
                onChange={(e) => setSelectedMatkul(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="Semua">Semua Mata Kuliah</option>
                {coursesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter Kelas */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[140px]">
              <select 
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="Semua">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k} value={k}>Kelas {k}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleExportCSV}
              disabled={filteredMahasiswa.length === 0}
              className="w-full sm:w-auto justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-gray-200 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[650px]">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 whitespace-nowrap">
                <tr>
                  <th className="px-6 py-4">NIM</th>
                  <th className="px-6 py-4">Nama Mahasiswa</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Program Studi</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 whitespace-nowrap">
                      Memuat data mahasiswa...
                    </td>
                  </tr>
                ) : filteredMahasiswa.length > 0 ? (
                  filteredMahasiswa.map((m) => (
                    <tr key={m.id || m.nim} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                      <td className="px-6 py-4 text-gray-900 font-medium font-mono">{m.nim}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold">{m.nama}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100 whitespace-nowrap inline-block">
                          {m.kelas}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{m.prodi}</td>
                      <td className="px-6 py-4 text-gray-500">{m.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className={`h-2 rounded-full ${m.kehadiran >= 80 ? 'bg-green-500' : m.kehadiran >= 60 ? 'bg-orange-500' : 'bg-red-500'}`} 
                              style={{ width: `${m.kehadiran}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${m.kehadiran >= 80 ? 'text-green-600' : m.kehadiran >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                            {m.kehadiran}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {mahasiswa.length === 0 
                        ? "Belum ada mahasiswa yang terdaftar di kelas pada mata kuliah yang Anda ampu." 
                        : "Tidak ada mahasiswa yang cocok dengan pencarian."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
