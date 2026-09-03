import { Eye, Pencil, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ActionButtons({
  onView,
  onEdit,
  onDelete,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      {onView && (
        <button
          onClick={onView}
          className="w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center transition"
        >
          <Eye size={15} />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded-lg text-gray-400 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-center transition"
        >
          <Pencil size={15} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
