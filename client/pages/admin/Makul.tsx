import { useMemo, useState } from "react";
import { Download, Plus, ClipboardList, BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import DataTable, { Column } from "@/components/table/DataTable";
import Badge from "@/components/table/Badge";
import StatusBadge from "@/components/table/StatusBadge";
import ActionButtons from "@/components/table/ActionButtons";
import FilterDropdown from "@/components/table/FilterDropdown";
import KelasFormModal, { KelasFormData } from "@/components/modal/ConfirmModal";
import ConfirmDeleteModal from "@/components/modal/DeleteModal";

interface MataKuliah {
  id: string;
  nama: string;
  icon?: string;
  sks: number;
  kodeKelas: string;
  programStudi: "Informatika" | "Sistem Informasi" | "Keamanan Informasi";
  aktif: boolean;
  dosenPengampu: string;
}

const programColor: Record<
  MataKuliah["programStudi"],
  "blue" | "green" | "orange"
> = {
  Informatika: "blue",
  "Sistem Informasi": "green",
  "Keamanan Informasi": "orange",
};

// Data dummy — ganti dengan fetch dari API
const DUMMY_DATA: MataKuliah[] = [
  {
    id: "1",
    nama: "Kesetaraan Informasi AI",
    sks: 3,
    kodeKelas: "TI-3A",
    programStudi: "Informatika",
    aktif: true,
    dosenPengampu: "Miftakhurokhmat",
  },
  {
    id: "2",
    nama: "Kesetaraan Informasi AI",
    sks: 3,
    kodeKelas: "TI-3A",
    programStudi: "Informatika",
    aktif: false,
    dosenPengampu: "Miftakhurokhmat",
  },
  {
    id: "3",
    nama: "Kesetaraan Informasi AI",
    sks: 2,
    kodeKelas: "TI-3A",
    programStudi: "Sistem Informasi",
    aktif: true,
    dosenPengampu: "Miftakhurokhmat",
  },
  {
    id: "4",
    nama: "Kesetaraan Informasi AI",
    sks: 4,
    kodeKelas: "TI-3A",
    programStudi: "Sistem Informasi",
    aktif: false,
    dosenPengampu: "Miftakhurokhmat",
  },
  {
    id: "5",
    nama: "Kesetaraan Informasi AI",
    sks: 2,
    kodeKelas: "TI-3A",
    programStudi: "Keamanan Informasi",
    aktif: true,
    dosenPengampu: "Miftakhurokhmat",
  },
  {
    id: "6",
    nama: "Kesetaraan Informasi AI",
    sks: 2,
    kodeKelas: "TI-3A",
    programStudi: "Keamanan Informasi",
    aktif: true,
    dosenPengampu: "Miftakhurokhmat",
  },
  {
    id: "7",
    nama: "Kesetaraan Informasi AI",
    sks: 2,
    kodeKelas: "TI-3A",
    programStudi: "Keamanan Informasi",
    aktif: false,
    dosenPengampu: "Miftakhurokhmat",
  },
];

export default function MataKuliah() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("all");
  const [status, setStatus] = useState("all");
  const [isLoading] = useState(false);

  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [selectedMataKuliah, setSelectedMataKuliah] =
    useState<MataKuliah | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MataKuliah | null>(null);

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

  const sksOptions = [
    { label: "2 SKS", value: "2" },
    { label: "3 SKS", value: "3" },
    { label: "4 SKS", value: "4" },
  ];

  const filteredData = useMemo(() => {
    return DUMMY_DATA.filter((row) => {
      const matchSearch = row.nama.toLowerCase().includes(search.toLowerCase());
      const matchKelas = kelas === "all" || row.kodeKelas === kelas;
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

  const handleSaveMataKuliah = (data: KelasFormData) => {
    // TODO: sambungkan ke API create/update
    console.log(formMode === "edit" ? "update" : "create", data);
  };

  const handleDeleteMataKuliah = () => {
    // TODO: sambungkan ke API delete
    console.log("delete", deleteTarget?.id);
  };

  const columns: Column<MataKuliah>[] = [
    {
      key: "nama",
      header: "Mata Kuliah",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-sm shrink-0">
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-semibold text-gray-800">{row.nama}</span>
        </div>
      ),
    },
    {
      key: "sks",
      header: "SKS",
      sortable: true,
      render: (row) => row.sks,
    },
    {
      key: "kodeKelas",
      header: "Kode Kelas",
      sortable: true,
      render: (row) => (
        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
          {row.kodeKelas}
        </span>
      ),
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
      key: "dosenPengampu",
      header: "Dosen Pengampu",
      render: (row) => row.dosenPengampu,
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (row) => (
        <ActionButtons
          onView={() => console.log("view", row.id)}
          onEdit={() => {
            setSelectedMataKuliah(row);
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
                  Manajemen Mata Kuliah
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  Kelola mata kuliah di Smart Lecture
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold border border-white/30 transition">
                  <Download size={16} />
                  Ekspor
                </button>
                <button
                  onClick={() => {
                    setSelectedMataKuliah(null);
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
            emptyMessage="Belum ada data mata kuliah"
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
      <KelasFormModal
        open={formMode !== null}
        mode={formMode ?? "add"}
        initialData={
          selectedMataKuliah
            ? {
                id: selectedMataKuliah.id,
                nama: selectedMataKuliah.nama,
                kodeKelas: selectedMataKuliah.kodeKelas,
                programStudi: selectedMataKuliah.programStudi,
                dosenPengampu: selectedMataKuliah.dosenPengampu,
                sks: String(selectedMataKuliah.sks),
                statusAktif: selectedMataKuliah.aktif,
              }
            : undefined
        }
        entityLabel="Mata Kuliah"
        programStudiOptions={programStudiOptions}
        sksOptions={sksOptions}
        onClose={() => {
          setFormMode(null);
          setSelectedMataKuliah(null);
        }}
        onSave={handleSaveMataKuliah}
      />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Hapus Mata Kuliah?"
        description={
          <>
            Apakah Anda yakin ingin menghapus data makul{" "}
            <strong className="text-gray-700">{deleteTarget?.nama}</strong> ?
          </>
        }
        itemPreview={
          deleteTarget
            ? {
                icon: deleteTarget.icon,
                title: deleteTarget.nama,
                subtitle: `${deleteTarget.programStudi} · Status ${
                  deleteTarget.aktif ? "Aktif" : "Tidak Aktif"
                }`,
              }
            : undefined
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteMataKuliah}
      />
    </DashboardLayout>
  );
}
