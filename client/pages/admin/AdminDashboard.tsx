import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const stats = [
    { label: "Total Dosen", value: "—", icon: GraduationCap, color: "bg-blue-100 text-blue-600" },
    { label: "Total Mahasiswa", value: "—", icon: Users, color: "bg-green-100 text-green-600" },
    { label: "Total Mata Kuliah", value: "—", icon: BookOpen, color: "bg-purple-100 text-purple-600" },
    { label: "Sesi Aktif", value: "—", icon: TrendingUp, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <DashboardLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">
            Halo, {user.name}!
          </h1>
          <p className="text-purple-600 font-semibold mt-1 text-sm lg:text-lg">
            Admin Dashboard — Smart Lecture
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-2 sm:gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
          <p className="text-gray-400 text-base">Konten admin dashboard akan ditambahkan nanti.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
