import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ChevronsUpDown, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  FileText
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function DosenJadwal() {
  const { user } = useAuth();
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for Create / Edit Session
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    classGroup: "",
    startTime: "",
    status: "scheduled"
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("Semua kelas");
  const [selectedStatus, setSelectedStatus] = useState("Semua status");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchJadwal = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/dosen/sessions?dosenId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setJadwal(data.data || []);
      }
    } catch (e) {
      console.error("Gagal mengambil jadwal:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndClasses = async () => {
    if (!user) return;
    try {
      const [resC, resCls] = await Promise.all([
        fetch(`/api/dosen/courses?dosenId=${user.id}`),
        fetch(`/api/dosen/classes`)
      ]);
      const [dataC, dataCls] = await Promise.all([resC.json(), resCls.json()]);
      
      if (dataC.success) setCourses(dataC.data || []);
      if (dataCls.success) setClassesList(dataCls.data || []);
    } catch (e) {
      console.error("Gagal mengambil mata kuliah dan kelas:", e);
    }
  };

  useEffect(() => {
    fetchJadwal();
    fetchCoursesAndClasses();
  }, [user]);

  const handleSaveJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/dosen/sessions/${editingId}` : "/api/dosen/sessions";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ courseId: "", title: "", classGroup: "", startTime: "", status: "scheduled" });
        fetchJadwal();
      } else {
        alert("Gagal menyimpan jadwal");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (j: any) => {
    setEditingId(j.id);
    setFormData({
      courseId: j.courseId,
      title: j.title,
      classGroup: j.classGroup || "",
      startTime: j.startTime ? new Date(j.startTime).toISOString().slice(0, 16) : "",
      status: j.status || "scheduled"
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      courseId: courses[0]?.id || "",
      title: "",
      classGroup: classesList[0]?.name || "TI-3A",
      startTime: new Date().toISOString().slice(0, 16),
      status: "scheduled"
    });
    setIsModalOpen(true);
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Yakin ingin menghapus sesi ini?")) return;
    try {
      const res = await fetch(`/api/dosen/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchJadwal();
      } else {
        alert("Gagal menghapus sesi");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper Program Studi murni disesuaikan dengan kelas yang ada
  const getProdi = (classGroupName?: string) => {
    if (!classGroupName) return "Informatika";

    // 1. Cek dari daftar kelas di database (classesList)
    const matchingClass = classesList.find(
      (c) => c.name?.toLowerCase().trim() === classGroupName.toLowerCase().trim()
    );
    if (matchingClass?.description) {
      const desc = matchingClass.description.toLowerCase();
      if (desc.includes("sistem informasi")) return "Sistem Informasi";
      if (desc.includes("keamanan") || desc.includes("security")) return "Keamanan Informasi";
      if (desc.includes("bisnis digital")) return "Bisnis Digital";
      if (desc.includes("informatika")) return "Informatika";
      if (desc.includes("rekayasa perangkat lunak")) return "Rekayasa Perangkat Lunak";
    }

    // 2. Berdasarkan inisial kode kelas yang dipilih (TI, SI, KI, BD, dll)
    const upper = classGroupName.toUpperCase().trim();
    if (upper.startsWith("SI")) return "Sistem Informasi";
    if (upper.startsWith("KI") || upper.startsWith("SK")) return "Keamanan Informasi";
    if (upper.startsWith("BD")) return "Bisnis Digital";
    if (upper.startsWith("TI")) return "Informatika";
    if (upper.startsWith("TRPL") || upper.startsWith("RPL")) return "Rekayasa Perangkat Lunak";

    return "Informatika";
  };

  const getProdiStyle = (prodi: string) => {
    switch (prodi) {
      case "Sistem Informasi":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Keamanan Informasi":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "Bisnis Digital":
        return "bg-purple-50 text-purple-700 border border-purple-100";
      default:
        return "bg-blue-50 text-blue-600 border border-blue-100";
    }
  };

  // Filtered and Sorted Jadwal
  const filteredJadwal = useMemo(() => {
    return jadwal
      .filter((item) => {
        const course = courses.find((c) => c.id === item.courseId);
        const name = item.courseName || course?.name || item.title;
        const code = item.classGroup || item.courseCode || "";
        const prodi = getProdi(item.classGroup);
        const isAktif = item.status === "scheduled" || item.status === "live";
        const statusLabel = isAktif ? "Aktif" : "Tidak Aktif";

        // Filter search
        const query = searchQuery.toLowerCase();
        const matchSearch =
          name.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          code.toLowerCase().includes(query) ||
          prodi.toLowerCase().includes(query);

        // Filter kelas
        const matchClass =
          selectedClass === "Semua kelas" || item.classGroup === selectedClass;

        // Filter status
        const matchStatus =
          selectedStatus === "Semua status" || statusLabel === selectedStatus;

        return matchSearch && matchClass && matchStatus;
      })
      .sort((a, b) => {
        const courseA = courses.find((c) => c.id === a.courseId);
        const courseB = courses.find((c) => c.id === b.courseId);
        const nameA = (a.courseName || courseA?.name || a.title).toLowerCase();
        const nameB = (b.courseName || courseB?.name || b.title).toLowerCase();
        const codeA = (a.classGroup || "").toLowerCase();
        const codeB = (b.classGroup || "").toLowerCase();

        let compare = 0;
        if (sortField === "name") compare = nameA.localeCompare(nameB);
        else if (sortField === "code") compare = codeA.localeCompare(codeB);
        else if (sortField === "status") compare = a.status.localeCompare(b.status);
        else if (sortField === "time") compare = new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime();
        else if (sortField === "document") {
          const docA = (a.primaryMaterial?.name || "").toLowerCase();
          const docB = (b.primaryMaterial?.name || "").toLowerCase();
          compare = docA.localeCompare(docB);
        }
        else compare = new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime();

        return sortOrder === "asc" ? compare : -compare;
      });
  }, [jadwal, courses, searchQuery, selectedClass, selectedStatus, sortField, sortOrder]);

  // Helper Format Tanggal & Waktu
  const formatSessionDate = (startTime?: string | Date) => {
    if (!startTime) return "-";
    try {
      const d = new Date(startTime);
      return d.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "-";
    }
  };

  const formatSessionTime = (startTime?: string | Date, endTime?: string | Date) => {
    if (!startTime) return "-";
    try {
      const start = new Date(startTime).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      });
      if (endTime) {
        const end = new Date(endTime).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit"
        });
        return `${start} - ${end} WIB`;
      }
      return `${start} WIB`;
    } catch {
      return "-";
    }
  };

  // Pagination
  const totalRows = filteredJadwal.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedData = filteredJadwal.slice(startIndex, endIndex);

  // Dynamic class options for filter
  const classOptions = useMemo(() => {
    const fromJadwal = jadwal.map((j) => j.classGroup).filter(Boolean);
    const fromList = classesList.map((c) => c.name);
    return Array.from(new Set([...fromJadwal, ...fromList]));
  }, [jadwal, classesList]);

  // Export CSV
  const handleExport = () => {
    if (filteredJadwal.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }
    const headers = ["Nama Kelas / Mata Kuliah", "Topik Sesi", "Kode", "Program Studi", "Tanggal", "Waktu", "Status", "Dokumen"];
    const rows = filteredJadwal.map((j) => {
      const course = courses.find((c) => c.id === j.courseId);
      const name = j.courseName || course?.name || j.title;
      const prodi = getProdi(j.classGroup);
      const isAktif = j.status === "scheduled" || j.status === "live";
      const statusText = isAktif ? "Aktif" : "Tidak Aktif";
      const dateStr = formatSessionDate(j.startTime);
      const timeStr = formatSessionTime(j.startTime, j.endTime);
      const docName = j.primaryMaterial?.name || "-";
      return [
        `"${name}"`,
        `"${j.title || '-'}"`,
        `"${j.classGroup || '-'}"`,
        `"${prodi}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${statusText}"`,
        `"${docName}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `manajemen_jadwal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
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
        <div className="w-full px-4 py-6 pb-10 lg:px-8 lg:py-8 lg:pb-10 max-w-7xl mx-auto flex flex-col gap-6">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                Manajemen Jadwal
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Kelola jadwal sesi mata kuliah di Smart Lecture
              </p>
            </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Tombol Ekspor */}
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-initial justify-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-gray-600" />
              Ekspor
            </button>

            {/* Tombol Tambah Kelas / Sesi */}
            <button
              onClick={openCreateModal}
              className="flex-1 sm:flex-initial justify-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Kelas
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col gap-5">
          
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            
            {/* Left Filters */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span>Tampilkan</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>data</span>
              </div>

              {/* Filter Semua Kelas */}
              <div className="relative inline-flex items-center">
                <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-xl pl-8 pr-8 py-2 text-xs font-medium text-gray-700 outline-none hover:border-gray-300 focus:ring-1 focus:ring-purple-500 appearance-none cursor-pointer"
                >
                  <option value="Semua kelas">Semua kelas</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 pointer-events-none" />
              </div>

              {/* Filter Semua Status */}
              <div className="relative inline-flex items-center">
                <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-200 rounded-xl pl-8 pr-8 py-2 text-xs font-medium text-gray-700 outline-none hover:border-gray-300 focus:ring-1 focus:ring-purple-500 appearance-none cursor-pointer"
                >
                  <option value="Semua status">Semua status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Right Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama atau NIM..."
                className="w-full bg-[#fbfbfc] border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <th
                    onClick={() => toggleSort("name")}
                    className="py-3.5 px-4 cursor-pointer hover:text-gray-600 transition-colors select-none min-w-[240px] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      NAMA KELAS
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("code")}
                    className="py-3.5 px-4 cursor-pointer hover:text-gray-600 transition-colors select-none min-w-[100px] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      KODE
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-gray-600 transition-colors select-none min-w-[160px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      PROGRAM STUDI
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("time")}
                    className="py-3.5 px-4 cursor-pointer hover:text-gray-600 transition-colors select-none min-w-[180px] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      WAKTU & TANGGAL
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("status")}
                    className="py-3.5 px-4 cursor-pointer hover:text-gray-600 transition-colors select-none min-w-[120px] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      STATUS
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("document")}
                    className="py-3.5 px-4 cursor-pointer hover:text-gray-600 transition-colors select-none min-w-[160px] whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      DOKUMEN
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center min-w-[100px] whitespace-nowrap">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-xs whitespace-nowrap">
                      Memuat data jadwal...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => {
                    const course = courses.find((c) => c.id === item.courseId);
                    const displayName = item.courseName || course?.name || item.title;
                    const prodi = getProdi(item.classGroup);
                    const prodiClass = getProdiStyle(prodi);
                    const isAktif = item.status === "scheduled" || item.status === "live";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-purple-50/20 transition-colors group"
                      >
                        {/* Kolom Nama Kelas / Mata Kuliah */}
                        <td className="py-3.5 px-4 min-w-[240px] whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800 shadow-xs flex items-center justify-center text-white font-bold text-xs">
                              <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&auto=format&fit=crop&q=80"
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              <span className="text-[10px] text-purple-300 font-semibold">
                                {displayName.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
                                {displayName}
                              </span>
                              {item.title && item.title !== displayName && (
                                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                  {item.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Kolom Kode */}
                        <td className="py-3.5 px-4 min-w-[100px] whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 text-xs font-mono font-medium bg-gray-100/90 text-gray-700 rounded-md border border-gray-200/80 whitespace-nowrap">
                            {item.classGroup || item.courseCode || "TI-3A"}
                          </span>
                        </td>

                        {/* Kolom Program Studi */}
                        <td className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${prodiClass}`}
                          >
                            {prodi}
                          </span>
                        </td>

                        {/* Kolom Waktu & Tanggal */}
                        <td className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-xs flex items-center gap-1.5 whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              {formatSessionDate(item.startTime)}
                            </span>
                            <span className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {formatSessionTime(item.startTime, item.endTime)}
                            </span>
                          </div>
                        </td>

                        {/* Kolom Status */}
                        <td className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">
                          {isAktif ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                              Tidak Aktif
                            </span>
                          )}
                        </td>

                        {/* Kolom Dokumen */}
                        <td className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">
                          {item.primaryMaterial ? (
                            <a
                              href={item.primaryMaterial.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-700 hover:text-purple-600 font-medium cursor-pointer transition-colors underline-offset-2 hover:underline flex items-center gap-1.5 max-w-[200px] truncate group/doc whitespace-nowrap"
                              title={`Unduh / Buka ${item.primaryMaterial.name}`}
                            >
                              <FileText className="w-3.5 h-3.5 text-red-500 shrink-0 group-hover/doc:text-purple-600 transition-colors" />
                              <span className="truncate">{item.primaryMaterial.name}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 font-medium text-xs pl-2 whitespace-nowrap">-</span>
                          )}
                        </td>

                        {/* Kolom Aksi */}
                        <td className="py-3.5 px-4 min-w-[100px] whitespace-nowrap">
                          <div className="flex items-center justify-center gap-3 text-gray-400">
                            {/* Tombol Lihat Detail Sesi */}
                            <Link
                              to={`/dosen/sesi/${item.id}`}
                              className="hover:text-purple-600 transition-colors p-1 rounded-md"
                              title="Lihat Detail & Sesi"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Tombol Edit */}
                            <button
                              onClick={() => openEditModal(item)}
                              className="hover:text-purple-600 transition-colors p-1 rounded-md"
                              title="Edit Sesi"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => handleDeleteSession(item.id)}
                              className="hover:text-red-600 transition-colors p-1 rounded-md"
                              title="Hapus Sesi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 text-xs whitespace-nowrap">
                      Tidak ada data jadwal yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer & Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-gray-50">
            <div className="text-xs text-gray-500">
              Menampilkan <span className="font-semibold text-gray-700">{totalRows === 0 ? 0 : startIndex + 1}-{endIndex}</span> dari{" "}
              <span className="font-semibold text-gray-700">{totalRows}</span> jadwal sesi
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && page - prev > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-1 text-xs text-gray-400 select-none">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                          currentPage === page
                            ? "bg-[#7C3AED] text-white shadow-xs"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Modal Tambah / Edit Sesi */}
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50" />
            <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[90vh] w-[90vw] max-w-[520px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-xl focus:outline-none z-50 overflow-y-auto">
              <Dialog.Title className="text-xl font-bold text-gray-900 mb-1">
                {editingId ? "Edit Jadwal Sesi" : "Tambah Kelas & Sesi Baru"}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-gray-500 mb-5">
                Sesuaikan parameter mata kuliah, kelas, topik sesi, dan jadwal waktu mulai.
              </Dialog.Description>

              <form className="space-y-4" onSubmit={handleSaveJadwal}>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mata Kuliah
                  </label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    disabled={!!editingId}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none disabled:bg-gray-100 cursor-pointer"
                  >
                    <option value="">-- Pilih Mata Kuliah --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Kelas
                    </label>
                    {formData.classGroup && (
                      <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        Prodi: {getProdi(formData.classGroup)}
                      </span>
                    )}
                  </div>
                  {classesList.length > 0 ? (
                    <select
                      required
                      value={formData.classGroup}
                      onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classesList.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.description ? `- ${c.description}` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      type="text"
                      value={formData.classGroup}
                      onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
                      placeholder="Contoh: TI-3A atau SI-2A"
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Topik Sesi
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Sistem Informasi Manajemen"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Waktu Mulai
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Status Perkuliahan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer"
                  >
                    <option value="scheduled">Akan Datang (Aktif)</option>
                    <option value="live">Sedang Berlangsung (LIVE)</option>
                    <option value="completed">Selesai (Tidak Aktif)</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-xs transition-colors"
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        </div>
      </div>
    </DashboardLayout>
  );
}

