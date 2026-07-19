interface BadgeProps {
  label: string;
  color: "blue" | "green" | "orange" | "purple" | "red" | "gray";
}

const colorMap: Record<BadgeProps["color"], string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({ label, color }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${colorMap[color]}`}
    >
      {label}
    </span>
  );
}
