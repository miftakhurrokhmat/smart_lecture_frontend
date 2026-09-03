import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GraduationCap, Users, BookOpen, Video, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/ui/statcard";
import AccountPreviewCard from "@/components/ui/previewcard";
import DosenFormModal, { DosenFormData } from "@/components/modal/DosenModal";
import MahasiswaFormModal, {
  MahasiswaFormData,
} from "@/components/modal/MahasiswaModal";

interface DashboardSummary {
  totalDosen: number;
  dosenAktif: number;
  totalMahasiswa: number;
  mahasiswaAktif: number;
  totalMataKuliah: number;
  sesiLiveHariIni: number;
}

interface AccountItem {
  id: string;
  name: string;
  subtitle: string;
  avatar?: string;
  active: boolean;
}

const kelasOptions = [
  { label: "TI-3A", value: "TI-3A" },
  { label: "TI-3C", value: "TI-3C" },
];

const programStudiOptions = [
  { label: "Informatika", value: "Informatika" },
  { label: "Sistem Informasi", value: "Sistem Informasi" },
  { label: "Keamanan Informasi", value: "Keamanan Informasi" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalDosen: 0,
    dosenAktif: 0,
    totalMahasiswa: 0,
    mahasiswaAktif: 0,
    totalMataKuliah: 0,
    sesiLiveHariIni: 0,
  });
  const [latestDosen, setLatestDosen] = useState<AccountItem[]>([]);
  const [latestMahasiswa, setLatestMahasiswa] = useState<AccountItem[]>([]);

  // Modal state — Tambah Dosen & Tambah Mahasiswa langsung dari Dashboard
  const [showAddDosen, setShowAddDosen] = useState(false);
  const [showAddMahasiswa, setShowAddMahasiswa] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard/admin-summary");
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
        setLatestDosen(data.latestDosen ?? []);
        setLatestMahasiswa(data.latestMahasiswa ?? []);
      }
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDosen = (data: DosenFormData) => {
    // TODO: sambungkan ke API create dosen, lalu refresh summary
    console.log("create dosen", data);
    fetchDashboard();
  };

  const handleSaveMahasiswa = (data: MahasiswaFormData) => {
    // TODO: sambungkan ke API create mahasiswa, lalu refresh summary
    console.log("create mahasiswa", data);
    fetchDashboard();
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div
        className="min-h-full w-full"
        style={{
          backgroundImage: "url('/assets/bg-cover.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "local",
        }}
      >
        <div className="w-full px-4 py-6 pb-10 lg:px-8 lg:py-8 lg:pb-10 flex flex-col gap-6">
          {/* Header card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500 px-6 py-6 lg:px-8 lg:py-7">
            <div
              className="absolute top-4 right-6 w-24 h-16 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.9) 1.5px, transparent 1.5px)",
                backgroundSize: "10px 10px",
              }}
            />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                Halo, {user.name}! 👋
              </h1>
              <p className="text-purple-100 text-sm mt-1">
                Kelola akun dosen dan mahasiswa yang terdaftar di Smart Lecture
                dari satu tempat.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={GraduationCap}
              label="Total Dosen"
              value={isLoading ? "—" : summary.totalDosen}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              icon={Users}
              label="Total Mahasiswa"
              value={isLoading ? "—" : summary.totalMahasiswa}
              iconBg="bg-green-50"
              iconColor="text-green-600"
            />
            <StatCard
              icon={BookOpen}
              label="Total Mata Kuliah"
              value={isLoading ? "—" : summary.totalMataKuliah}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
            />
            <StatCard
              icon={Video}
              label="Sesi Live Hari Ini"
              value={isLoading ? "—" : summary.sesiLiveHariIni}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
            />
          </div>

          {/* Manajemen Akun */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-base lg:text-lg font-bold text-gray-900">
                Manajemen Akun
              </h3>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                Akun yang sudah terdaftar
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <AccountPreviewCard
                title="Dosen"
                icon={GraduationCap}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                totalCount={summary.totalDosen}
                activeCount={summary.dosenAktif}
                items={latestDosen}
                manageUrl="/admin/dosen"
                onAddClick={() => setShowAddDosen(true)}
                addLabel="Tambah Dosen"
              />
              <AccountPreviewCard
                title="Mahasiswa"
                icon={Users}
                iconBg="bg-green-50"
                iconColor="text-green-600"
                totalCount={summary.totalMahasiswa}
                activeCount={summary.mahasiswaAktif}
                items={latestMahasiswa}
                manageUrl="/admin/mahasiswa"
                onAddClick={() => setShowAddMahasiswa(true)}
                addLabel="Tambah Mahasiswa"
              />
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-purple-600 rounded-2xl p-4 lg:p-5 flex items-center gap-3 lg:gap-4">
            <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-white shrink-0" />
            <p className="text-white text-sm lg:text-base font-medium">
              Akun baru yang mendaftar akan muncul di sini sebelum kamu aktifkan
              aksesnya.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Tambah Dosen — muncul langsung di Dashboard */}
      <DosenFormModal
        open={showAddDosen}
        mode="add"
        kelasOptions={kelasOptions}
        programStudiOptions={programStudiOptions}
        onClose={() => setShowAddDosen(false)}
        onSave={handleSaveDosen}
      />

      {/* Modal Tambah Mahasiswa — muncul langsung di Dashboard */}
      <MahasiswaFormModal
        open={showAddMahasiswa}
        mode="add"
        kelasOptions={kelasOptions}
        programStudiOptions={programStudiOptions}
        onClose={() => setShowAddMahasiswa(false)}
        onSave={handleSaveMahasiswa}
      />
    </DashboardLayout>
  );
}
