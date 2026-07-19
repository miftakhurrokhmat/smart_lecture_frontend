import { useMemo, useState } from "react";
import { Download, Plus, Mail } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import DataTable, { Column } from "@/components/table/DataTable";
import Badge from "@/components/table/Badge";
import StatusBadge from "@/components/table/StatusBadge";
import ActionButtons from "@/components/table/ActionButtons";
import FilterDropdown from "@/components/table/FilterDropdown";
import MahasiswaFormModal, {
  MahasiswaFormData,
} from "@/components/modal/MahasiswaModal";
import ConfirmDeleteModal from "@/components/modal/DeleteModal";

interface Mahasiswa {
  id: string;
  nama: string;
  avatar: string;
  nim: string;
  kelas: string;
  programStudi: "Informatika" | "Sistem Informasi" | "Keamanan Informasi";
  aktif: boolean;
  email: string;
}

const programColor: Record<
  Mahasiswa["programStudi"],
  "blue" | "green" | "orange"
> = {
  Informatika: "blue",
  "Sistem Informasi": "green",
  "Keamanan Informasi": "orange",
};

// Data dummy — ganti dengan fetch dari API
const DUMMY_DATA: Mahasiswa[] = [
  {
    id: "1",
    nama: "Ahmad Fauzi",
    avatar: "https://i.pravatar.cc/100?img=21",
    nim: "2109282828",
    kelas: "TI-3A",
    programStudi: "Informatika",
    aktif: true,
    email: "ahmad.fauzi@gmail.com",
  },
  {
    id: "2",
    nama: "Siti Nur Aini",
    avatar: "https://i.pravatar.cc/100?img=22",
    nim: "2109282829",
    kelas: "TI-3A",
    programStudi: "Informatika",
    aktif: false,
    email: "siti.nuraini@gmail.com",
  },
  {
    id: "3",
    nama: "Budi Santoso",
    avatar: "https://i.pravatar.cc/100?img=23",
    nim: "2109282830",
    kelas: "TI-3C",
    programStudi: "Sistem Informasi",
    aktif: true,
    email: "budi.santoso@gmail.com",
  },
  {
    id: "4",
    nama: "Dewi Lestari",
    avatar: "https://i.pravatar.cc/100?img=24",
    nim: "2109282831",
    kelas: "TI-3C",
    programStudi: "Sistem Informasi",
    aktif: false,
    email: "dewi.lestari@gmail.com",
  },
  {
    id: "5",
    nama: "Rizky Ramadhan",
    avatar: "https://i.pravatar.cc/100?img=25",
    nim: "2109282832",
    kelas: "TI-3C",
    programStudi: "Keamanan Informasi",
    aktif: true,
    email: "rizky.ramadhan@gmail.com",
  },
  {
    id: "6",
    nama: "Putri Ayu",
    avatar: "https://i.pravatar.cc/100?img=26",
    nim: "2109282833",
    kelas: "TI-3C",
    programStudi: "Keamanan Informasi",
    aktif: true,
    email: "putri.ayu@gmail.com",
  },
  {
    id: "7",
    nama: "Fajar Nugroho",
    avatar: "https://i.pravatar.cc/100?img=27",
    nim: "2109282834",
    kelas: "TI-3A",
    programStudi: "Keamanan Informasi",
    aktif: false,
    email: "fajar.nugroho@gmail.com",
  },
];

export default function Mahasiswa() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("all");
  const [status, setStatus] = useState("all");
  const [isLoading] = useState(false);

  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Mahasiswa | null>(null);

  const kelasFilterOptions = [
    { label: "Semua kelas", value: "all" },
    { label: "TI-3A", value: "TI-3A" },
    { label: "TI-3C", value: "TI-3C" },
  ];

  const kelasOptions = [
    { label: "TI-3A", value: "TI-3A" },
    { label: "TI-3C", value: "TI-3C" },
  ];

  const programStudiOptions = [
    { label: "Informatika", value: "Informatika" },
    { label: "Sistem Informasi", value: "Sistem Informasi" },
    { label: "Keamanan Informasi", value: "Keamanan Informasi" },
  ];

  const filteredData = useMemo(() => {
    return DUMMY_DATA.filter((row) => {
      const matchSearch =
        row.nama.toLowerCase().includes(search.toLowerCase()) ||
        row.nim.includes(search);
      const matchKelas = kelas === "all" || row.kelas === kelas;
      const matchStatus =
        status === "all" ||
        (status === "active" && row.aktif) ||
        (status === "inactive" && !row.aktif);
      return matchSearch && matchKelas && matchStatus;
    });
  }, [search, kelas, status]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const handleSaveMahasiswa = (data: MahasiswaFormData) => {
    // TODO: sambungkan ke API create/update
    console.log(formMode === "edit" ? "update" : "create", data);
  };

  const handleDeleteMahasiswa = () => {
    // TODO: sambungkan ke API delete
    console.log("delete", deleteTarget?.id);
  };

  const columns: Column<Mahasiswa>[] = [
    {
      key: "nama",
      header: "Nama Mahasiswa",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.nama}
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-semibold text-gray-800">{row.nama}</span>
        </div>
      ),
    },
    {
      key: "nim",
      header: "NIM",
      sortable: true,
      render: (row) => (
        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
          {row.nim}
        </span>
      ),
    },
    {
      key: "kelas",
      header: "Kelas",
      sortable: true,
      render: (row) => row.kelas,
    },
    {
      key: "programStudi",
      header: "Program Studi",
      sortable: true,
      render: (row) => (
        <Badge
          label={row.programStudi}
          color={programColor[row.programStudi]}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge active={row.aktif} />,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
          <Mail size={14} className="text-gray-400" />
          {row.email}
        </span>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (row) => (
        <ActionButtons
          onView={() => console.log("view", row.id)}
          onEdit={() => {
            setSelectedMahasiswa(row);
            setFormMode("edit");
          }}
          onDelete={() => setDeleteTarget(row)}
        />
      ),
    },
  ];

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

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">
                  Manajemen Mahasiswa
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  Kelola data mahasiswa di Smart Lecture
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold border border-white/30 transition">
                  <Download size={16} />
                  Ekspor
                </button>
                <button
                  onClick={() => {
                    setSelectedMahasiswa(null);
                    setFormMode("add");
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-purple-600 text-sm font-bold transition"
                >
                  <Plus size={16} />
                  Tambah Mahasiswa
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <DataTable
            data={paginatedData}
            columns={columns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            page={page}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={setPage}
            onPageSizeChange={(n) => {
              setPageSize(n);
              setPage(1);
            }}
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Cari nama atau NIM..."
            itemLabel="mahasiswa"
            emptyMessage="Belum ada data mahasiswa"
            filters={
              <>
                <FilterDropdown
                  label="Semua kelas"
                  value={kelas}
                  onChange={(v) => {
                    setKelas(v);
                    setPage(1);
                  }}
                  options={kelasFilterOptions}
                />
                <FilterDropdown
                  label="Semua status"
                  value={status}
                  onChange={(v) => {
                    setStatus(v);
                    setPage(1);
                  }}
                  options={[
                    { label: "Semua status", value: "all" },
                    { label: "Aktif", value: "active" },
                    { label: "Tidak Aktif", value: "inactive" },
                  ]}
                />
              </>
            }
          />
        </div>
      </div>

      {/* Modals */}
      <MahasiswaFormModal
        open={formMode !== null}
        mode={formMode ?? "add"}
        initialData={
          selectedMahasiswa
            ? {
                id: selectedMahasiswa.id,
                nama: selectedMahasiswa.nama,
                nim: selectedMahasiswa.nim,
                kelas: selectedMahasiswa.kelas,
                programStudi: selectedMahasiswa.programStudi,
                email: selectedMahasiswa.email,
                statusAktif: selectedMahasiswa.aktif,
              }
            : undefined
        }
        kelasOptions={kelasOptions}
        programStudiOptions={programStudiOptions}
        onClose={() => {
          setFormMode(null);
          setSelectedMahasiswa(null);
        }}
        onSave={handleSaveMahasiswa}
      />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Hapus Mahasiswa?"
        description={
          <>
            Apakah Anda yakin ingin menghapus data mahasiswa{" "}
            <strong className="text-gray-700">{deleteTarget?.nama}</strong> ?
          </>
        }
        itemPreview={
          deleteTarget
            ? {
                avatar: deleteTarget.avatar,
                title: deleteTarget.nama,
                subtitle: `${deleteTarget.programStudi} · Status ${
                  deleteTarget.aktif ? "Aktif" : "Tidak Aktif"
                }`,
              }
            : undefined
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteMahasiswa}
      />
    </DashboardLayout>
  );
}
