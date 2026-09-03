import { useMemo, useState } from "react";
import { Download, Plus, Mail } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import DataTable, { Column } from "@/components/table/DataTable";
import Badge from "@/components/table/Badge";
import StatusBadge from "@/components/table/StatusBadge";
import ActionButtons from "@/components/table/ActionButtons";
import FilterDropdown from "@/components/table/FilterDropdown";
import DosenFormModal, { DosenFormData } from "@/components/modal/DosenModal";
import ConfirmDeleteModal from "@/components/modal/DeleteModal";

interface Dosen {
  id: string;
  nama: string;
  avatar: string;
  nidn: string;
  kelas: string;
  programStudi: "Informatika" | "Sistem Informasi" | "Keamanan Informasi";
  aktif: boolean;
  email: string;
}

const programColor: Record<Dosen["programStudi"], "blue" | "green" | "orange"> =
  {
    Informatika: "blue",
    "Sistem Informasi": "green",
    "Keamanan Informasi": "orange",
  };

// Data dummy — ganti dengan fetch dari API
const DUMMY_DATA: Dosen[] = [
  {
    id: "1",
    nama: "Miftakhurokhmat, M.Kom.",
    avatar: "https://i.pravatar.cc/100?img=11",
    nidn: "1109282828",
    kelas: "TI-3A",
    programStudi: "Informatika",
    aktif: true,
    email: "miftakhurokhmat@gmail.com",
  },
  {
    id: "2",
    nama: "Miftakhurokhmat, M.Kom.",
    avatar: "https://i.pravatar.cc/100?img=12",
    nidn: "1109282828",
    kelas: "TI-3A",
    programStudi: "Informatika",
    aktif: false,
    email: "miftakhurokhmat@gmail.com",
  },
  {
    id: "3",
    nama: "Miftakhurokhmat, M.Kom.",
    avatar: "https://i.pravatar.cc/100?img=13",
    nidn: "1109282828",
    kelas: "TI-3C",
    programStudi: "Sistem Informasi",
    aktif: true,
    email: "miftakhurokhmat@gmail.com",
  },
  {
    id: "4",
    nama: "Miftakhurokhmat, M.Kom.",
    avatar: "https://i.pravatar.cc/100?img=14",
    nidn: "1109282828",
    kelas: "TI-3C",
    programStudi: "Sistem Informasi",
    aktif: false,
    email: "miftakhurokhmat@gmail.com",
  },
  {
    id: "5",
    nama: "Tinuk Agustin, M.Kom.",
    avatar: "https://i.pravatar.cc/100?img=15",
    nidn: "1109282828",
    kelas: "TI-3C",
    programStudi: "Keamanan Informasi",
    aktif: true,
    email: "miftakhurokhmat@gmail.com",
  },
  {
    id: "6",
    nama: "Miftakhurokhmat, M.Kom.",
    avatar: "https://i.pravatar.cc/100?img=16",
    nidn: "1109282828",
    kelas: "TI-3C",
    programStudi: "Keamanan Informasi",
    aktif: true,
    email: "miftakhurokhmat@gmail.com",
  },
  {
    id: "7",
    nama: "Robi, M.Kom.",
    avatar: "https://i.pravatar.cc/100?img=17",
    nidn: "1109282828",
    kelas: "TI-3A",
    programStudi: "Keamanan Informasi",
    aktif: false,
    email: "miftakhurokhmat@gmail.com",
  },
];

export default function Dosen() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("all");
  const [status, setStatus] = useState("all");
  const [isLoading] = useState(false);

  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [selectedDosen, setSelectedDosen] = useState<Dosen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dosen | null>(null);

  const kelasOptions = [
    { label: "Semua kelas", value: "all" },
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
        row.nidn.includes(search);
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

  const handleSaveDosen = (data: DosenFormData) => {
    // TODO: sambungkan ke API create/update
    console.log(formMode === "edit" ? "update" : "create", data);
  };

  const handleDeleteDosen = () => {
    // TODO: sambungkan ke API delete
    console.log("delete", deleteTarget?.id);
  };

  const columns: Column<Dosen>[] = [
    {
      key: "nama",
      header: "Nama Dosen",
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
      key: "nidn",
      header: "NIDN",
      sortable: true,
      render: (row) => (
        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
          {row.nidn}
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
            setSelectedDosen(row);
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
                  Manajemen Dosen
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  Kelola jadwal sesi mata kuliah di Smart Lecture
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold border border-white/30 transition">
                  <Download size={16} />
                  Ekspor
                </button>
                <button
                  onClick={() => {
                    setSelectedDosen(null);
                    setFormMode("add");
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-purple-600 text-sm font-bold transition"
                >
                  <Plus size={16} />
                  Tambah Kelas
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
            emptyMessage="Belum ada data dosen"
            filters={
              <>
                <FilterDropdown
                  label="Semua kelas"
                  value={kelas}
                  onChange={(v) => {
                    setKelas(v);
                    setPage(1);
                  }}
                  options={kelasOptions}
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
      <DosenFormModal
        open={formMode !== null}
        mode={formMode ?? "add"}
        initialData={
          selectedDosen
            ? {
                id: selectedDosen.id,
                nama: selectedDosen.nama,
                nidn: selectedDosen.nidn,
                kelas: selectedDosen.kelas,
                programStudi: selectedDosen.programStudi,
                email: selectedDosen.email,
                statusAktif: selectedDosen.aktif,
              }
            : undefined
        }
        kelasOptions={kelasOptions.filter((o) => o.value !== "all")}
        programStudiOptions={programStudiOptions}
        onClose={() => {
          setFormMode(null);
          setSelectedDosen(null);
        }}
        onSave={handleSaveDosen}
      />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Hapus Dosen?"
        description={
          <>
            Apakah Anda yakin ingin menghapus data dosen{" "}
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
        onConfirm={handleDeleteDosen}
      />
    </DashboardLayout>
  );
}
