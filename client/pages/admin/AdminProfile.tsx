import { DashboardLayout } from "@/components/DashboardLayout";
import { User } from "lucide-react";

export default function AdminProfile() {
  return (
    <DashboardLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-purple-600" />
          Profile Admin
        </h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
          <p className="text-gray-400 text-base">Halaman profile admin akan ditambahkan nanti.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
