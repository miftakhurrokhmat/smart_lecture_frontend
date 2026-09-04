import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  Calendar, 
  Clock,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time?: string;
  classGroup?: string;
  status: "Aktif" | "Selesai";
  done?: boolean;
}

const monthsName = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const monthsMap: Record<string, string> = {
  januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06",
  juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12"
};

export const formatDeadlineDate = (dateStr: string) => {
  if (!dateStr) return "-";
  if (dateStr.includes("Mei") || dateStr.includes("Januari") || dateStr.includes("Maret")) {
    return dateStr;
  }
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${monthsName[monthIndex]} ${year}`;
    }
  }
  return dateStr;
};

export const parseToDateInputValue = (str: string) => {
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parts = str.split(" ");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const m = monthsMap[parts[1].toLowerCase()];
    const year = parts[2];
    if (m && year) return `${year}-${m}-${day}`;
  }
  return "";
};

export function PengingatSection() {
  const { user } = useAuth();
  const isDosen = user?.role === "dosen";

  const checklistKey = `smartlecture_reminder_checklist_${user?.id || "guest"}`;

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [classesList, setClassesList] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Local checklist ids (per-user checklist state)
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(checklistKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Modal States (hanya aktif untuk dosen)
  const [modalType, setModalType] = useState<"tambah" | "edit" | "hapus" | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  // Form States
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formClassGroup, setFormClassGroup] = useState("Semua Kelas");
  const [formStatus, setFormStatus] = useState<"Aktif" | "Selesai">("Aktif");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil data pengingat dari backend
  const fetchReminders = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reminders?userId=${user.id}&role=${user.role}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setReminders(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat data pengingat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil daftar kelas untuk dropdown input dosen
  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/dosen/classes");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setClassesList(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat kelas:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReminders();
      if (isDosen) {
        fetchClasses();
      }
    }
  }, [user, isDosen]);

  // Simpan checklist state ke localStorage
  const handleToggleChecklist = async (reminder: Reminder) => {
    const nextDone = !checkedIds.includes(reminder.id);
    const newChecked = nextDone
      ? [...checkedIds, reminder.id]
      : checkedIds.filter(id => id !== reminder.id);

    setCheckedIds(newChecked);
    try {
      localStorage.setItem(checklistKey, JSON.stringify(newChecked));
    } catch {
      // fallback
    }

    // Jika dosen, perbarui juga status master di database
    if (isDosen) {
      try {
        await fetch(`/api/reminders/${reminder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: nextDone ? "Selesai" : "Aktif"
          })
        });
        fetchReminders();
      } catch (e) {
        console.error("Gagal sinkron status:", e);
      }
    }
  };

  const handleOpenTambahModal = () => {
    setFormError("");
    setFormTitle("");
    const today = new Date().toISOString().split("T")[0];
    setFormDate(today);
    setFormTime("23:59");
    setFormClassGroup(classesList.length > 0 ? classesList[0].name : "Semua Kelas");
    setFormStatus("Aktif");
    setSelectedReminder(null);
    setModalType("tambah");
  };

  const handleOpenEditModal = (reminder: Reminder) => {
    setFormError("");
    setSelectedReminder(reminder);
    setFormTitle(reminder.title);
    setFormDate(parseToDateInputValue(reminder.date) || reminder.date);
    setFormTime(reminder.time || "23:59");
    setFormClassGroup(reminder.classGroup || "Semua Kelas");
    setFormStatus(reminder.status);
    setModalType("edit");
  };

  const handleOpenHapusModal = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setModalType("hapus");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedReminder(null);
    setFormError("");
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Judul pengingat wajib diisi.");
      return;
    }
    if (!formDate) {
      setFormError("Tanggal deadline wajib diisi.");
      return;
    }
    if (!formClassGroup) {
      setFormError("Target kelas wajib dipilih.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      if (modalType === "tambah") {
        const res = await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            date: formDate,
            time: formTime.trim() || "23:59",
            classGroup: formClassGroup,
            instructorId: user?.id,
            status: formStatus,
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal menambah pengingat");
      } else if (modalType === "edit" && selectedReminder) {
        const res = await fetch(`/api/reminders/${selectedReminder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            date: formDate,
            time: formTime.trim() || "23:59",
            classGroup: formClassGroup,
            status: formStatus,
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal mengubah pengingat");
      }

      handleCloseModal();
      fetchReminders();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmHapus = async () => {
    if (!selectedReminder) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/reminders/${selectedReminder.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus pengingat");

      handleCloseModal();
      fetchReminders();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pengingat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Pengingat Card Container */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-4 sm:p-6 shadow-xs flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900 text-lg">Pengingat</h3>
          </div>
          
          {/* Tombol Tambah HANYA muncul untuk role Dosen */}
          {isDosen && (
            <button
              onClick={handleOpenTambahModal}
              className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer shadow-xs"
              title="Tambah Pengingat"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full mt-4 mb-3" />

        {/* Reminders List */}
        <div className="flex flex-col gap-3.5 max-h-[360px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-6 flex flex-col gap-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              {isDosen 
                ? "Belum ada pengingat. Klik tombol + untuk menambahkan pengingat kelas." 
                : "Belum ada pengingat untuk kelas Anda saat ini."}
            </div>
          ) : (
            reminders.map((r) => {
              const isChecked = checkedIds.includes(r.id) || (isDosen && r.status === "Selesai");

              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 group transition-colors py-1"
                >
                  {/* Left: Checkbox + Title & Deadline & Target Class */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleChecklist(r)}
                      className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "border-gray-300 hover:border-purple-400 bg-white"
                      }`}
                      title={isChecked ? "Tandai belum selesai" : "Tandai selesai"}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p
                          className={`text-sm font-bold truncate transition-colors ${
                            isChecked ? "line-through text-gray-400" : "text-gray-900"
                          }`}
                        >
                          {r.title}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400">
                          Deadline: {formatDeadlineDate(r.date)} {r.time ? `• ${r.time}` : ""}
                        </span>
                        {r.classGroup && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            r.classGroup === "Semua Kelas"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}>
                            {r.classGroup}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions Edit & Delete HANYA untuk Dosen */}
                  {isDosen && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(r)}
                        className="w-8 h-8 rounded-lg bg-purple-100/70 hover:bg-purple-200/80 text-purple-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Pengingat"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenHapusModal(r)}
                        className="w-8 h-8 rounded-lg bg-red-100/70 hover:bg-red-200/80 text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus Pengingat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Tambah atau Edit Pengingat (Dosen Only) */}
      {isDosen && (modalType === "tambah" || modalType === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900 text-base">
                  {modalType === "tambah" ? "Tambah Pengingat" : "Edit Pengingat"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="flex flex-col gap-4 mt-4">
              {formError && (
                <div className="p-2.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
                  {formError}
                </div>
              )}

              {/* Judul Pengingat */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Judul Pengingat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kerjakan tugas Basis Data"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Pilihan Target Kelas */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  Target Kelas
                </label>
                <select
                  value={formClassGroup}
                  onChange={(e) => setFormClassGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 font-medium"
                  required
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.name}>
                      Kelas {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Hanya mahasiswa dari kelas terpilih yang akan menerima pengingat ini.
                </p>
              </div>

              {/* Tanggal Deadline & Waktu (opsional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Tanggal Deadline
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Waktu <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Status Pengingat
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "Aktif" | "Selesai")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 font-medium"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl border border-gray-300 font-bold text-sm text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Pengingat (Dosen Only) */}
      {isDosen && modalType === "hapus" && selectedReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900 text-base">Hapus Pengingat</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-20 h-20 bg-red-100/80 rounded-full flex items-center justify-center mb-3">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h4 className="font-bold text-gray-900 text-base">
                Hapus Pengingat Ini?
              </h4>
              <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">
                Pengingat &ldquo;{selectedReminder.title}&rdquo; untuk {selectedReminder.classGroup || "kelas"} akan dihapus secara permanen.
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl border border-gray-300 font-bold text-sm text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmHapus}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Hapus"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
