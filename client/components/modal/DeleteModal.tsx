import { X, Trash2, Folder } from "lucide-react";

interface ItemPreview {
  avatar?: string;
  icon?: React.ReactNode;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10 text-center animate-in fade-in zoom-in-95 duration-150">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trash icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>

        {/* Description */}
        <div className="mt-2 text-sm text-gray-500 leading-relaxed">
          {description}
        </div>

        {/* Optional item preview card */}
        {itemPreview && (
          <div className="mt-5 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            {itemPreview.avatar ? (
              <img
                src={itemPreview.avatar}
                alt={itemPreview.title}
                className="w-9 h-9 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-sm shrink-0 text-white">
                {itemPreview.icon ?? <Folder className="w-4 h-4 text-gray-300" />}
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
