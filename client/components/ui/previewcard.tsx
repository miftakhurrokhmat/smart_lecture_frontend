import { Link } from "react-router-dom";
import { ArrowRight, UserPlus, LucideIcon } from "lucide-react";
import StatusBadge from "@/components/table/StatusBadge";

interface AccountPreviewItem {
  id: string;
  name: string;
  subtitle: string;
  avatar?: string;
  active: boolean;
}

interface AccountPreviewCardProps {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  totalCount: number;
  activeCount: number;
  items: AccountPreviewItem[];
  manageUrl: string;
  onAddClick?: () => void;
  addLabel?: string;
}

export default function AccountPreviewCard({
  title,
  icon: Icon,
  iconBg,
  iconColor,
  totalCount,
  activeCount,
  items,
  manageUrl,
  onAddClick,
  addLabel = "Tambah",
}: AccountPreviewCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeCount} aktif dari {totalCount} akun
            </p>
          </div>
        </div>

        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-semibold transition shrink-0"
          >
            <UserPlus size={13} />
            {addLabel}
          </button>
        )}
      </div>

      {/* Preview list */}
      <div className="flex flex-col gap-3 flex-1">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            Belum ada data
          </p>
        )}

        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-white shrink-0">
                  {item.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
              </div>
            </div>
            <StatusBadge active={item.active} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <Link
        to={manageUrl}
        className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
      >
        Kelola {title}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}