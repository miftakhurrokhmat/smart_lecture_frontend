import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  Building2, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  School, 
  GraduationCap, 
  X, 
  AlertCircle 
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface StudyProgram {
  id: string;
  name: string;
  code: string;
  faculty?: string | null;
  description?: string | null;
  classesCount?: number;
}

export default function AdminProdi() {
  const [prodiList, setProdiList] = useState<StudyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProdi, setEditingProdi] = useState<StudyProgram | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    faculty: "",
    description: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<StudyProgram | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchProdi = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/prodi");
      const data = await res.json();
      if (data.success) {
        setProdiList(data.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat data program studi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdi();
  }, []);

  const openCreateModal = () => {
    setEditingProdi(null);
    setFormData({ code: "", name: "", faculty: "", description: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: StudyProgram) => {
    setEditingProdi(p);
    setFormData({
      code: p.code,
      name: p.name,
      faculty: p.faculty || "",
      description: p.description || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const url = editingProdi
        ? `/api/admin/prodi/${editingProdi.id}`
        : "/api/admin/prodi";
      const method = editingProdi ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        fetchProdi();
      } else {
        setFormError(data.message || "Gagal menyimpan program studi.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Terjadi kesalahan pada sistem. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/admin/prodi/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteTarget(null);
        fetchProdi();
      } else {
        setDeleteError(data.message || "Gagal menghapus program studi.");
      }
    } catch (err) {
      console.error(err);
      setDeleteError("Terjadi kesalahan saat menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProdi = useMemo(() => {
    return prodiList.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.faculty && p.faculty.toLowerCase().includes(q))
      );
    });
  }, [prodiList, searchQuery]);

  const totalClassesCount = useMemo(() => {
    return prodiList.reduce((acc, curr) => acc + (curr.classesCount || 0), 0);
  }, [prodiList]);

  return (
    <DashboardLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-purple-600 shrink-0" />
              Manajemen Program Studi
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Kelola master program studi untuk pengelompokan kelas dan mahasiswa.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Program Studi
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{prodiList.length}</p>
            <p className="text-xs sm:text-sm text-gray-500">Total Program Studi</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalClassesCount}</p>
            <p className="text-xs sm:text-sm text-gray-500">Total Kelas Terhubung</p>
          </div>
        </div>

        {/* Content Table Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, kode, atau fakultas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white"
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-500">
              Total: {filteredProdi.length} Program Studi
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-sm border-collapse min-w-[750px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 whitespace-nowrap">
                <tr>
                  <th className="px-6 py-4 font-bold">Kode</th>
                  <th className="px-6 py-4 font-bold">Nama Program Studi</th>
                  <th className="px-6 py-4 font-bold">Fakultas</th>
                  <th className="px-6 py-4 font-bold">Deskripsi</th>
                  <th className="px-6 py-4 font-bold text-center">Jumlah Kelas</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm whitespace-nowrap">
                      Memuat data program studi...
                    </td>
                  </tr>
                ) : filteredProdi.length > 0 ? (
                  filteredProdi.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors whitespace-nowrap">
                      {/* Kode */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 font-mono font-bold rounded-md border border-purple-100 text-xs">
                          {p.code}
                        </span>
                      </td>

                      {/* Nama Program Studi */}
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {p.name}
                      </td>

                      {/* Fakultas */}
                      <td className="px-6 py-4 text-gray-600">
                        {p.faculty || "-"}
                      </td>

                      {/* Deskripsi */}
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                        {p.description || "-"}
                      </td>

                      {/* Jumlah Kelas */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {p.classesCount || 0} Kelas
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit Program Studi"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError("");
                              setDeleteTarget(p);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Program Studi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500 text-sm whitespace-nowrap">
                      Tidak ada program studi yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah / Edit Program Studi */}
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50" />
            <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-5 sm:p-6 shadow-xl focus:outline-none z-50 overflow-y-auto">
              <div className="flex justify-between items-center mb-1">
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  {editingProdi ? "Edit Program Studi" : "Tambah Program Studi Baru"}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Description className="text-xs text-gray-500 mb-4">
                Lengkapi informasi program studi, kode jurusan, fakultas, dan deskripsi.
              </Dialog.Description>

              {formError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Kode Program Studi <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: TI, SI, KI, BD"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600 font-mono text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Gunakan singkatan atau inisial prodi (huruf kapital).</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nama Program Studi <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Teknik Informatika"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Fakultas
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Fakultas Ilmu Komputer"
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Keterangan singkat mengenai program studi ini..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600 text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-6 pt-2">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 text-sm"
                    >
                      Batal
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Modal Konfirmasi Hapus */}
        <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50" />
            <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-5 sm:p-6 shadow-xl focus:outline-none z-50">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>

              <Dialog.Title className="text-lg font-bold text-gray-900 text-center mb-2">
                Hapus Program Studi
              </Dialog.Title>

              <Dialog.Description className="text-sm text-gray-500 text-center mb-4 leading-relaxed">
                Yakin ingin menghapus Program Studi{" "}
                <span className="font-bold text-gray-800">{deleteTarget?.name} ({deleteTarget?.code})</span>?
              </Dialog.Description>

              {deleteError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 text-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 text-sm disabled:opacity-50"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

      </div>
    </DashboardLayout>
  );
}
