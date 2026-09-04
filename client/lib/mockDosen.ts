export const mockJadwal = [
  { id: 1, mataKuliah: "Pemrograman Web", tanggal: "2026-09-04", jam: "08:00 - 10:30", kelas: "TI-3A", status: "Akan datang", hadir: 0, total: 40 },
  { id: 2, mataKuliah: "Struktur Data", tanggal: "2026-09-03", jam: "13:00 - 15:30", kelas: "TI-2B", status: "Selesai", hadir: 38, total: 40 },
  { id: 3, mataKuliah: "Basis Data", tanggal: "2026-09-05", jam: "10:00 - 12:30", kelas: "SI-2A", status: "Akan datang", hadir: 0, total: 35 },
];

export const mockMateri = [
  { id: 1, judul: "Pengenalan React", mataKuliah: "Pemrograman Web", tipe: "pdf", tanggal: "2026-09-01", url: "#" },
  { id: 2, judul: "Tree dan Graph", mataKuliah: "Struktur Data", tipe: "ppt", tanggal: "2026-08-28", url: "#" },
  { id: 3, judul: "Normalisasi Database", mataKuliah: "Basis Data", tipe: "pdf", tanggal: "2026-08-30", url: "#" },
];

export const mockDiskusi = [
  { id: 1, penanya: "Minato", mataKuliah: "Pemrograman Web", sesi: "Pengenalan React", pertanyaan: "Bagaimana cara kerja useEffect?", status: "Belum Dijawab", waktu: "1 jam lalu" },
  { id: 2, penanya: "Budi", mataKuliah: "Struktur Data", sesi: "Tree dan Graph", pertanyaan: "Apa bedanya DFS dan BFS?", status: "Sudah Dijawab", waktu: "1 hari lalu" },
  { id: 3, penanya: "Siti", mataKuliah: "Basis Data", sesi: "Normalisasi", pertanyaan: "Apakah BCNF selalu diperlukan?", status: "Belum Dijawab", waktu: "2 jam lalu" },
];

export const mockMahasiswa = [
  { nim: "12345678", nama: "Minato", email: "minato@smartlecture.com", kehadiran: 95 },
  { nim: "12345679", nama: "Budi Santoso", email: "budi@smartlecture.com", kehadiran: 80 },
  { nim: "12345680", nama: "Siti Aminah", email: "siti@smartlecture.com", kehadiran: 100 },
  { nim: "12345681", nama: "Andi Saputra", email: "andi@smartlecture.com", kehadiran: 75 },
];

export const mockLaporan = {
  totalSesi: 24,
  rataDurasi: "120 mnt",
  totalMahasiswa: 115,
  rataKehadiran: "87%",
  grafik: [
    { nama: "Pertemuan 1", kehadiran: 95 },
    { nama: "Pertemuan 2", kehadiran: 92 },
    { nama: "Pertemuan 3", kehadiran: 88 },
    { nama: "Pertemuan 4", kehadiran: 90 },
    { nama: "Pertemuan 5", kehadiran: 85 },
  ]
};
