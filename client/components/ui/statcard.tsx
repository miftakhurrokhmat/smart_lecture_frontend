import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: string; positive?: boolean };
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  iconBg = "bg-purple-50",
  iconColor = "text-purple-600",
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-400 mt-0.5">{label}</p>
        {trend && (
          <p
            className={`text-xs font-semibold mt-1 ${
              trend.positive ? "text-green-600" : "text-red-500"
            }`}
          >
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}