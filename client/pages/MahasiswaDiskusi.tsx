import { DashboardLayout } from "@/components/DashboardLayout";
import { DiskusiForum } from "@/components/DiskusiForum";

export default function MahasiswaDiskusi() {
  return (
    <DashboardLayout>
      <DiskusiForum
        pageTitle="Forum Diskusi & Tanya Jawab"
        pageSubtitle="Diskusikan materi dan tanyakan topik perkuliahan kepada dosen atau sesama mahasiswa."
      />
    </DashboardLayout>
  );
}
