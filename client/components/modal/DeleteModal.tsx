import { X, Trash2 } from "lucide-react";

interface ItemPreview {
  avatar?: string;
  icon?: string;
  title: string;
  subtitle: string;
}

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  itemPreview?: ItemPreview;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  itemPreview,
  confirmLabel = "Ya, Hapus",
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center -mt-2">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>

        {itemPreview && (
          <div className="mt-5 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            {itemPreview.avatar ? (
              <img
                src={itemPreview.avatar}
                alt={itemPreview.title}
                className="w-9 h-9 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-sm shrink-0">
                {itemPreview.icon ?? "📁"}
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {itemPreview.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {itemPreview.subtitle}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
