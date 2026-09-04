import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, Search, Plus, Trash2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

export default function AdminMatakuliah() {
  const [courses, setCourses] = useState<any[]>([]);
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", instructorId: "" });

  const fetchData = async () => {
    try {
      const [coursesRes, dosenRes] = await Promise.all([
        fetch("/api/admin/courses"),
        fetch("/api/admin/users?role=dosen")
      ]);
      const coursesData = await coursesRes.json();
      const dosenData = await dosenRes.json();
      
      if (coursesData.success) setCourses(coursesData.data);
      if (dosenData.success) setDosenList(dosenData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", code: "", instructorId: "" });
        fetchData(); // Refresh list
      } else {
        alert("Gagal membuat matkul. Mungkin kode kelas duplikat.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Manajemen Mata Kuliah
            </h1>
          </div>
          
          <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Dialog.Trigger asChild>
              <button className="w-full sm:w-auto justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Tambah Matkul
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-5 sm:p-6 shadow-xl focus:outline-none z-50 overflow-y-auto">
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-1">Tambah Matkul Baru</Dialog.Title>
                <Dialog.Description className="text-xs text-gray-500 mb-4">
                  Lengkapi data mata kuliah baru dan pilih dosen pengampu.
                </Dialog.Description>
                <form className="space-y-4" onSubmit={handleCreateCourse}>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Mata Kuliah</label>
                    <input required type="text" placeholder="Contoh: Pemrograman Web" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kode Kelas</label>
                    <input required type="text" placeholder="Contoh: TI-3A" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Dosen Pengampu</label>
                    <select required value={formData.instructorId} onChange={e => setFormData({...formData, instructorId: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600">
                      <option value="">-- Pilih Dosen --</option>
                      {dosenList.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.identifier})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Dialog.Close asChild>
                      <button type="button" className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                    </Dialog.Close>
                    <button type="submit" className="flex-1 px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">Simpan Matkul</button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Cari Matkul..." className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
            </div>
            <span className="text-sm font-bold text-gray-500">Total: {courses.length} Matkul</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 whitespace-nowrap">
                <tr>
                  <th className="px-6 py-4 font-bold">Nama Mata Kuliah</th>
                  <th className="px-6 py-4 font-bold">Kode Kelas</th>
                  <th className="px-6 py-4 font-bold">Dosen Pengampu</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">Memuat data...</td></tr>
                ) : courses.length > 0 ? (
                  courses.map((c) => {
                    const dosen = dosenList.find(d => d.id === c.instructorId);
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <td className="px-6 py-4 font-semibold text-gray-900">{c.name}</td>
                        <td className="px-6 py-4 font-mono text-gray-500">{c.code}</td>
                        <td className="px-6 py-4 text-gray-600">{dosen ? dosen.name : "Tidak diketahui"}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">Belum ada mata kuliah.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
