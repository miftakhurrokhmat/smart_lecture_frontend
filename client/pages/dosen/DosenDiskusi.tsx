import { DashboardLayout } from "@/components/DashboardLayout";
import { DiskusiForum } from "@/components/DiskusiForum";

export default function DosenDiskusi() {
  return (
    <DashboardLayout>
      <DiskusiForum
        pageTitle="Diskusi & Tanya Jawab"
        pageSubtitle="Kelola dan tanggapi diskusi atau pertanyaan mahasiswa seputar sesi perkuliahan."
      />
    </DashboardLayout>
  );
}
