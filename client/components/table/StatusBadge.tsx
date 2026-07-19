interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export default function StatusBadge({
  active,
  activeLabel = "Aktif",
  inactiveLabel = "Tidak Aktif",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        active ? "text-green-600" : "text-red-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
