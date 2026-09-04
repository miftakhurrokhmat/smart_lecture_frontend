import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GraduationCap, Search, Plus, Trash2 } from "lucide-react";

export default function AdminDosen() {
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", identifier: "", prodi: "" });

  const fetchDosen = async () => {
    try {
      const res = await fetch("/api/admin/users?role=dosen");
      const data = await res.json();
      if (data.success) {
        setDosenList(data.data);
      }
    } catch (error) {
      console.error("Gagal memuat dosen", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDosen();
  }, []);

  const handleAddDosen = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "dosen" }),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", email: "", password: "", identifier: "", prodi: "" });
        fetchDosen();
      } else {
        alert("Gagal menambah dosen. Mungkin email sudah ada.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dosen ini?")) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      fetchDosen();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            Manajemen Dosen
          </h1>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Dosen
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Cari dosen..." className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
            </div>
            <span className="text-sm font-bold text-gray-500">Total: {dosenList.length} Dosen</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 whitespace-nowrap">
                <tr>
                  <th className="px-6 py-4 font-bold">Nama Lengkap</th>
                  <th className="px-6 py-4 font-bold">NIDN / NIP</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Fakultas / Prodi</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">Memuat data...</td></tr>
                ) : dosenList.length > 0 ? (
                  dosenList.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors whitespace-nowrap">
                      <td className="px-6 py-4 font-semibold text-gray-900">{d.name}</td>
                      <td className="px-6 py-4 font-mono text-gray-500">{d.identifier || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{d.email}</td>
                      <td className="px-6 py-4 text-gray-600">{d.prodi || "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(d.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">Belum ada data dosen.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tambah */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Tambah Dosen Baru</h2>
            <form onSubmit={handleAddDosen} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">NIDN / NIP</label>
                <input type="text" value={formData.identifier} onChange={e => setFormData({...formData, identifier: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Program Studi</label>
                <input type="text" value={formData.prodi} onChange={e => setFormData({...formData, prodi: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">Simpan Dosen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
