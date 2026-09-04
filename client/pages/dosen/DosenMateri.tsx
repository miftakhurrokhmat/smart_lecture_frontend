import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, Plus, FileCode2, FileSpreadsheet, Download, BookOpen } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/contexts/AuthContext";

export default function DosenMateri() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materiList, setMateriList] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [sessionId, setSessionId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchMateri = async () => {
    try {
      // Currently fetches all materials. Ideally filter by dosen's sessions. 
      // For now, it's fine since we just need it working. 
      const res = await fetch("/api/dosen/materials");
      const data = await res.json();
      if (data.success) setMateriList(data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/dosen/sessions?dosenId=${user.id}`);
      const data = await res.json();
      if (data.success) setSessions(data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchMateri();
    fetchSessions();
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !sessionId) return alert("Pilih sesi dan file terlebih dahulu.");

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/dosen/materials", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setIsModalOpen(false);
        setSelectedFile(null);
        setSessionId("");
        fetchMateri();
      } else {
        alert("Gagal mengunggah materi.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFileIcon = (tipe: string) => {
    const t = tipe.toLowerCase();
    if (t.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
    if (t.includes("ppt")) return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;
    return <FileCode2 className="w-8 h-8 text-blue-500" />;
  };

  return (
    <DashboardLayout>
      <div className="w-full px-4 py-6 lg:px-8 lg:py-8 flex flex-col gap-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Materi Perkuliahan
            </h1>
            <p className="text-gray-500 text-sm mt-1">Kelola slide, modul, dan dokumen pendukung perkuliahan.</p>
          </div>
          
          <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Dialog.Trigger asChild>
              <button className="w-full sm:w-auto justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                Upload Materi
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-xl focus:outline-none z-50 overflow-y-auto">
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-1">Upload Materi Baru</Dialog.Title>
                <Dialog.Description className="text-xs text-gray-500 mb-4">
                  Pilih sesi kelas dan unggah berkas materi perkuliahan.
                </Dialog.Description>
                <form className="space-y-4" onSubmit={handleUpload}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Sesi Kelas</label>
                    <select required value={sessionId} onChange={e => setSessionId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                      <option value="">-- Pilih Sesi --</option>
                      {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File Dokumen</label>
                    <input 
                      type="file" 
                      required
                      onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Dialog.Close asChild>
                      <button type="button" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                    </Dialog.Close>
                    <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm">
                      Upload File
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {loading ? (
             <p className="text-center text-gray-500 py-8">Memuat materi...</p>
          ) : materiList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materiList.map((m) => (
                <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 mt-1">
                    {getFileIcon(m.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate" title={m.name}>{m.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Ukuran: {m.size} | {new Date(m.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-2 mt-3">
                      <a href={m.url} target="_blank" rel="noreferrer" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-gray-200">
                        <Download className="w-3.5 h-3.5" />
                        Unduh
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              Belum ada materi yang diunggah.
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
