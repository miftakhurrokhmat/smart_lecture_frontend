import { useState, useEffect } from "react";
import { Bell, X, Trash2, Calendar, Clock, ChevronDown } from "lucide-react";

export interface ReminderData {
  id?: string;
  title: string;
  deadline: string;
  time?: string;
  status: "Aktif" | "Nonaktif";
}

interface PengingatProps {
  open: boolean;
  mode: "add" | "edit" | "delete";
  initialData?: ReminderData;
  onClose: () => void;
  onSave?: (data: ReminderData) => void;
  onDelete?: (id?: string) => void;
}

export default function Pengingat({
  open,
  mode,
  initialData,
  onClose,
  onSave,
  onDelete,
}: PengingatProps) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [time, setTime] = useState("23:59");
  const [status, setStatus] = useState<"Aktif" | "Nonaktif">("Aktif");

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setDeadline(initialData?.deadline ?? "");
      setTime(initialData?.time ?? "23:59");
      setStatus(initialData?.status ?? "Aktif");
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSave = () => {
    onSave?.({ id: initialData?.id, title, deadline, time, status });
    onClose();
  };

  const handleDelete = () => {
    onDelete?.(initialData?.id);
    onClose();
  };

  const headerTitle =
    mode === "delete"
      ? "Hapus Pengingat"
      : mode === "edit"
        ? "Edit Pengingat"
        : "Tambah Pengingat";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-[360px] bg-white rounded-3xl shadow-xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-base">{headerTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === "delete" ? (
          <>
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">
                Hapus Pengingat Ini?
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Pengingat "{initialData?.title}" akan dihapus secara permanen
                dan tidak dapat dipulihkan
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition"
              >
                Hapus
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Judul Pengingat
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Kerjakan tugas Basis Data"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tanggal Deadline
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      placeholder="20 Mei 2024"
                      className="w-full border border-gray-200 rounded-xl pl-3.5 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Waktu{" "}
                    <span className="text-gray-400 font-normal">
                      (opsional)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="23:59"
                      className="w-full border border-gray-200 rounded-xl pl-3.5 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                    />
                    <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "Aktif" | "Nonaktif")
                    }
                    className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
              >
                Simpan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
