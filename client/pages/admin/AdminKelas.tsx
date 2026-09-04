import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, Plus, Trash2, Search, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminKelas() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Program Studi
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [selectedFilterProdi, setSelectedFilterProdi] = useState("Semua Program Studi");
  const [searchClass, setSearchClass] = useState("");

  // State Create Class
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");
  const [newClassProdiId, setNewClassProdiId] = useState("");

  // State Manage Class Students
  const [managingClass, setManagingClass] = useState<any>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [allMahasiswa, setAllMahasiswa] = useState<any[]>([]);
  const [searchMahasiswa, setSearchMahasiswa] = useState("");

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/admin/classes");
      const data = await res.json();
      if (data.success) setClasses(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProdi = async () => {
    try {
      const res = await fetch("/api/admin/prodi");
      const data = await res.json();
      if (data.success && data.data) {
        setProdiList(data.data);
        if (data.data.length > 0 && !newClassProdiId) {
          setNewClassProdiId(data.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllMahasiswa = async () => {
    try {
      const res = await fetch("/api/admin/users?role=mahasiswa");
      const data = await res.json();
      if (data.success) setAllMahasiswa(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchProdi();
    fetchAllMahasiswa();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassProdiId) {
      alert("Pilih Program Studi terlebih dahulu.");
      return;
    }
    const selectedProdiObj = prodiList.find((p) => p.id === newClassProdiId);
    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newClassName, 
          description: newClassDesc,
          prodiId: newClassProdiId,
          prodi: selectedProdiObj?.name || ""
        })
      });
      if (res.ok) {
        setNewClassName("");
        setNewClassDesc("");
        setIsCreateOpen(false);
        fetchClasses();
      } else {
        const errData = await res.json();
        alert(errData.message || "Gagal membuat kelas. Kemungkinan nama kelas sudah ada.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if(!confirm("Yakin ingin menghapus kelas ini?")) return;
    try {
      await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
      fetchClasses();
    } catch (e) {
      console.error(e);
    }
  };

  const openManageClass = async (cls: any) => {
    setManagingClass(cls);
    try {
      const res = await fetch(`/api/admin/classes/${cls.id}/students`);
      const data = await res.json();
      if (data.success) setClassStudents(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignStudent = async (studentId: string) => {
    try {
      await fetch(`/api/admin/classes/${managingClass.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });
      openManageClass(managingClass);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await fetch(`/api/admin/classes/${managingClass.id}/students/${studentId}`, {
        method: "DELETE"
      });
      openManageClass(managingClass);
    } catch (e) {
      console.error(e);
    }
  };

  const availableStudents = allMahasiswa.filter(m => 
    !classStudents.find(cs => cs.id === m.id) &&
    (m.name.toLowerCase().includes(searchMahasiswa.toLowerCase()) || m.email.toLowerCase().includes(searchMahasiswa.toLowerCase()))
  );

  const filteredClasses = classes.filter((cls) => {
    const q = searchClass.toLowerCase().trim();
    const matchesSearch = !q || cls.name.toLowerCase().includes(q) || (cls.description && cls.description.toLowerCase().includes(q));
    const matchesProdi = selectedFilterProdi === "Semua Program Studi" || cls.prodi === selectedFilterProdi;
    return matchesSearch && matchesProdi;
  });

  return (
    <DashboardLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Manajemen Kelas
            </h1>
            <p className="text-gray-500 text-sm mt-1">Kelola rombongan belajar / kelas mahasiswa per program studi.</p>
          </div>

          <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Dialog.Trigger asChild>
              <button 
                onClick={() => {
                  if (prodiList.length > 0 && !newClassProdiId) {
                    setNewClassProdiId(prodiList[0].id);
                  }
                }}
                className="w-full sm:w-auto justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Kelas
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-5 sm:p-6 shadow-xl z-50 overflow-y-auto">
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-1">Tambah Kelas Baru</Dialog.Title>
                <Dialog.Description className="text-xs text-gray-500 mb-4">
                  Pilih program studi dan tentukan nama rombel atau kelas.
                </Dialog.Description>
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program Studi <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={newClassProdiId}
                      onChange={(e) => setNewClassProdiId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 outline-none bg-white font-medium text-gray-800"
                    >
                      <option value="">-- Pilih Program Studi --</option>
                      {prodiList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Setiap kelas wajib mencantumkan program studi yang tersedia.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Kelas <span className="text-red-500">*</span>
                    </label>
                    <input required type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Contoh: TI-3A" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <input type="text" value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)} placeholder="Contoh: Teknik Informatika Semester 3 Kelas A" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 outline-none" />
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <Dialog.Close asChild>
                      <button type="button" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                    </Dialog.Close>
                    <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg">Simpan</button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama kelas..."
              value={searchClass}
              onChange={(e) => setSearchClass(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Filter:</span>
            <select
              value={selectedFilterProdi}
              onChange={(e) => setSelectedFilterProdi(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 bg-white text-gray-700 font-medium"
            >
              <option value="Semua Program Studi">Semua Program Studi</option>
              {prodiList.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Classes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
             <div className="col-span-full py-12 text-center text-gray-500">Memuat data kelas...</div>
          ) : filteredClasses.length > 0 ? (
            filteredClasses.map(cls => (
              <div key={cls.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-gray-900">{cls.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                      {cls.prodi || "Informatika"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cls.description || "Tidak ada deskripsi"}</p>
                  <p className="text-xs font-semibold text-purple-600 mt-3">{cls.studentCount || 0} Mahasiswa</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button onClick={() => openManageClass(cls)} className="flex-1 bg-purple-50 text-purple-700 hover:bg-purple-100 py-2 rounded-lg text-sm font-bold transition-colors">
                    Atur Mahasiswa
                  </button>
                  <button onClick={() => handleDeleteClass(cls.id)} className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 text-sm">
              Tidak ada kelas yang sesuai dengan pencarian atau filter program studi.
            </div>
          )}
        </div>

        {/* Modal Atur Mahasiswa */}
        <Dialog.Root open={!!managingClass} onOpenChange={(open) => !open && setManagingClass(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[90vh] w-[95vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white flex flex-col shadow-xl z-50 overflow-hidden">
              <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200">
                <div>
                  <Dialog.Title className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-2">
                    Anggota Kelas: {managingClass?.name}
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-gray-500 mt-0.5">
                    Kelola dan daftarkan mahasiswa ke dalam rombongan belajar kelas ini.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="p-2 hover:bg-gray-100 rounded-full shrink-0"><X className="w-5 h-5 text-gray-500" /></button>
                </Dialog.Close>
              </div>
              
              <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                {/* Kiri: Tambah Mahasiswa */}
                <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 h-[300px] md:h-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">Tambahkan Mahasiswa</h3>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                      <input type="text" placeholder="Cari nama/email..." value={searchMahasiswa} onChange={e => setSearchMahasiswa(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {availableStudents.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm mt-4">Tidak ada mahasiswa yang tersedia.</p>
                    ) : availableStudents.map(m => (
                      <div key={m.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                        <button onClick={() => handleAssignStudent(m.id)} className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                          Tambah
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kanan: Daftar Mahasiswa Kelas */}
                <div className="w-full md:w-1/2 flex flex-col bg-white h-[300px] md:h-auto">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Mahasiswa di Kelas Ini</h3>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">{classStudents.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {classStudents.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm mt-4">Belum ada mahasiswa di kelas ini.</p>
                    ) : classStudents.map(m => (
                      <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                        <button onClick={() => handleRemoveStudent(m.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

      </div>
    </DashboardLayout>
  );
}
