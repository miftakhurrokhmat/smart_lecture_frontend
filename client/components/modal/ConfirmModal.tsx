import { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import Toggle from "@/components/ui/toggle";

export interface KelasFormData {
  id?: string;
  nama: string;
  kodeKelas: string;
  programStudi: string;
  dosenPengampu: string;
  sks: string;
  statusAktif: boolean;
}

interface SelectOption {
  label: string;
  value: string;
}

interface KelasFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  initialData?: KelasFormData;

  // Konfigurasi supaya reusable di entitas "kelas" lain
  entityLabel?: string; // ex: "Mata Kuliah", "Kelas Pelatihan"
  namaPlaceholder?: string;
  kodeKelasPlaceholder?: string;
  dosenPlaceholder?: string;
  programStudiOptions: SelectOption[];
  sksOptions: SelectOption[];

  onClose: () => void;
  onSave: (data: KelasFormData) => void;
}

const emptyForm: KelasFormData = {
  nama: "",
  kodeKelas: "",
  programStudi: "",
  dosenPengampu: "",
  sks: "",
  statusAktif: true,
};

export default function KelasFormModal({
  open,
  mode,
  initialData,
  entityLabel = "Mata Kuliah",
  namaPlaceholder = "Contoh: Basis Data",
  kodeKelasPlaceholder = "20389821",
  dosenPlaceholder = "Nama dosen pengampu",
  programStudiOptions,
  sksOptions,
  onClose,
  onSave,
}: KelasFormModalProps) {
  const [form, setForm] = useState<KelasFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(initialData ?? emptyForm);
    }
  }, [open, initialData]);

  if (!open) return null;

  const isEdit = mode === "edit";
  const isValid =
    form.nama.trim() && form.kodeKelas.trim() && form.programStudi;

  const handleSave = () => {
    if (!isValid) return;
    onSave(form);
    onClose();
  };

  const set = <K extends keyof KelasFormData>(
    key: K,
    value: KelasFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? `Edit ${entityLabel}` : `Tambah ${entityLabel}`}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {isEdit
                ? `Update informasi ${entityLabel.toLowerCase()} di sistem Smart Lecture.`
                : `Daftarkan ${entityLabel.toLowerCase()} baru ke dalam sistem admin Smart Lecture.`}
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
              {isEdit ? `Nama ${entityLabel}` : entityLabel}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              placeholder={namaPlaceholder}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Nama {entityLabel.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kode Kelas <span className="text-red-500">*</span>
              </label>
              <input
                value={form.kodeKelas}
                onChange={(e) => set("kodeKelas", e.target.value)}
                placeholder={kodeKelasPlaceholder}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Kode kelas {entityLabel.toLowerCase()}.
              </p>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Dosen Pengampu
              </label>
              <input
                value={form.dosenPengampu}
                onChange={(e) => set("dosenPengampu", e.target.value)}
                placeholder={dosenPlaceholder}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Keterangan dosen pengampu.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                SKS
              </label>
              <div className="relative">
                <select
                  value={form.sks}
                  onChange={(e) => set("sks", e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-white"
                >
                  <option value="">— Pilih sks —</option>
                  {sksOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Status Aktif */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Status Aktif
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Keterangan status dosen di sistem Smart Lecture.
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
