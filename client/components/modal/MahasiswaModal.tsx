import { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import Toggle from "@/components/ui/toggle";

export interface MahasiswaFormData {
  id?: string;
  nama: string;
  nim: string;
  kelas: string;
  programStudi: string;
  email: string;
  statusAktif: boolean;
}

interface SelectOption {
  label: string;
  value: string;
}

interface MahasiswaFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  initialData?: MahasiswaFormData;
  kelasOptions: SelectOption[];
  programStudiOptions: SelectOption[];
  onClose: () => void;
  onSave: (data: MahasiswaFormData) => void;
}

const emptyForm: MahasiswaFormData = {
  nama: "",
  nim: "",
  kelas: "",
  programStudi: "",
  email: "",
  statusAktif: true,
};

export default function MahasiswaFormModal({
  open,
  mode,
  initialData,
  kelasOptions,
  programStudiOptions,
  onClose,
  onSave,
}: MahasiswaFormModalProps) {
  const [form, setForm] = useState<MahasiswaFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(initialData ?? emptyForm);
    }
  }, [open, initialData]);

  if (!open) return null;

  const isEdit = mode === "edit";
  const isValid =
    form.nama.trim() &&
    form.nim.trim() &&
    form.programStudi &&
    form.email.trim();

  const handleSave = () => {
    if (!isValid) return;
    onSave(form);
    onClose();
  };

  const set = <K extends keyof MahasiswaFormData>(
    key: K,
    value: MahasiswaFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {isEdit
                ? "Update informasi mahasiswa di sistem Smart Lecture."
                : "Daftarkan mahasiswa baru ke dalam sistem admin Smart Lecture."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nama Mahasiswa <span className="text-red-500">*</span>
            </label>
            <input
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              placeholder="Contoh: Manone Nama"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Nama lengkap mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                NIM <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nim}
                onChange={(e) => set("nim", e.target.value)}
                placeholder="2109282828"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Nomor Induk Mahasiswa.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kelas
              </label>
              <div className="relative">
                <select
                  value={form.kelas}
                  onChange={(e) => set("kelas", e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-white"
                >
                  <option value="">— Pilih kelas —</option>
                  {kelasOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Program Studi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.programStudi}
                  onChange={(e) => set("programStudi", e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-white"
                >
                  <option value="">— Pilih jurusan —</option>
                  {programStudiOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="mahasiswa@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
              />
            </div>
          </div>

          {/* Status Aktif */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Status Aktif
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Keterangan status mahasiswa di sistem Smart Lecture.
              </p>
            </div>
            <Toggle
              checked={form.statusAktif}
              onChange={(v) => set("statusAktif", v)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">* Wajib diisi</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
