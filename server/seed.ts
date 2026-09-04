import "dotenv/config";
import { db } from "./db";
import { users, classes, classStudents, courses, sessions, reminders, studyPrograms } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("[SEED] Memulai proses inisialisasi dan seeding database...");

    // 0. Pastikan tabel study_programs dan kolom baru classes terinisialisasi
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "study_programs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL UNIQUE,
        "code" text NOT NULL UNIQUE,
        "faculty" text,
        "description" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    await db.execute(sql`
      ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "prodi_id" uuid REFERENCES "study_programs"("id") ON DELETE SET NULL;
    `);
    await db.execute(sql`
      ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "prodi" text;
    `);

    // 1. Seed Users
    let admin = await db.select().from(users).where(eq(users.email, "admin@smartlecture.com")).limit(1);
    let adminUser = admin[0];
    if (!adminUser) {
      await db.insert(users).values({
        email: "admin@smartlecture.com",
        password: "admin123",
        name: "Administrator Sistem",
        role: "admin",
      });
      const [newAdmin] = await db.select().from(users).where(eq(users.email, "admin@smartlecture.com")).limit(1);
      adminUser = newAdmin;
      console.log("[SEED] Akun Admin berhasil dibuat.");
    }

    let dosen = await db.select().from(users).where(eq(users.email, "dosen@smartlecture.com")).limit(1);
    let dosenUser = dosen[0];
    if (!dosenUser) {
      await db.insert(users).values({
        email: "dosen@smartlecture.com",
        password: "dosen123",
        name: "Dr. Santoso Makmur",
        role: "dosen",
        identifier: "0011223344",
        prodi: "Teknik Informatika",
        gender: "Laki-laki",
      });
      const [newDosen] = await db.select().from(users).where(eq(users.email, "dosen@smartlecture.com")).limit(1);
      dosenUser = newDosen;
      console.log("[SEED] Akun Dosen berhasil dibuat.");
    }

    let mhs1 = await db.select().from(users).where(eq(users.email, "mahasiswa@smartlecture.com")).limit(1);
    let mhs1User = mhs1[0];
    if (!mhs1User) {
      await db.insert(users).values({
        email: "mahasiswa@smartlecture.com",
        password: "mhs123",
        name: "Budi Mahasiswa",
        role: "mahasiswa",
        identifier: "123456789",
        prodi: "Teknik Informatika",
        gender: "Laki-laki",
      });
      const [newMhs1] = await db.select().from(users).where(eq(users.email, "mahasiswa@smartlecture.com")).limit(1);
      mhs1User = newMhs1;
      console.log("[SEED] Akun Mahasiswa 1 berhasil dibuat.");
    }

    let mhs2 = await db.select().from(users).where(eq(users.email, "siti@student.smartlecture.com")).limit(1);
    let mhs2User = mhs2[0];
    if (!mhs2User) {
      await db.insert(users).values({
        email: "siti@student.smartlecture.com",
        password: "mhs123",
        name: "Siti Rahma",
        role: "mahasiswa",
        identifier: "123456790",
        prodi: "Teknik Informatika",
        gender: "Perempuan",
      });
      const [newMhs2] = await db.select().from(users).where(eq(users.email, "siti@student.smartlecture.com")).limit(1);
      mhs2User = newMhs2;
      console.log("[SEED] Akun Mahasiswa 2 berhasil dibuat.");
    }

    // 2. Seed Study Programs (Prodi)
    const defaultProdis = [
      { code: "TI", name: "Teknik Informatika", faculty: "Fakultas Ilmu Komputer", description: "Program Studi S1 Teknik Informatika" },
      { code: "SI", name: "Sistem Informasi", faculty: "Fakultas Ilmu Komputer", description: "Program Studi S1 Sistem Informasi" },
      { code: "KI", name: "Keamanan Informasi", faculty: "Fakultas Ilmu Komputer", description: "Program Studi S1 Keamanan Siber & Informasi" },
      { code: "BD", name: "Bisnis Digital", faculty: "Fakultas Ekonomi & Bisnis", description: "Program Studi S1 Bisnis Digital" },
      { code: "TRPL", name: "Rekayasa Perangkat Lunak", faculty: "Fakultas Ilmu Komputer", description: "Program Studi Terapan Rekayasa Perangkat Lunak" },
    ];

    for (const p of defaultProdis) {
      const existingProdi = await db.select().from(studyPrograms).where(eq(studyPrograms.code, p.code)).limit(1);
      if (existingProdi.length === 0) {
        await db.insert(studyPrograms).values(p);
      }
    }
    console.log("[SEED] Data master Program Studi berhasil diverifikasi.");

    const tiProdiList = await db.select().from(studyPrograms).where(eq(studyPrograms.code, "TI")).limit(1);
    const tiProdi = tiProdiList[0];

    // 3. Seed Classes
    let classA = await db.select().from(classes).where(eq(classes.name, "TI-3A")).limit(1);
    let classARecord = classA[0];
    if (!classARecord) {
      await db.insert(classes).values({
        name: "TI-3A",
        description: "Teknik Informatika Semester 3 Kelas A",
        prodiId: tiProdi?.id || null,
        prodi: tiProdi?.name || "Teknik Informatika",
      });
      const [newClassA] = await db.select().from(classes).where(eq(classes.name, "TI-3A")).limit(1);
      classARecord = newClassA;
      console.log("[SEED] Kelas TI-3A berhasil dibuat.");
    }

    let classB = await db.select().from(classes).where(eq(classes.name, "TI-3B")).limit(1);
    let classBRecord = classB[0];
    if (!classBRecord) {
      await db.insert(classes).values({
        name: "TI-3B",
        description: "Teknik Informatika Semester 3 Kelas B",
        prodiId: tiProdi?.id || null,
        prodi: tiProdi?.name || "Teknik Informatika",
      });
      const [newClassB] = await db.select().from(classes).where(eq(classes.name, "TI-3B")).limit(1);
      classBRecord = newClassB;
      console.log("[SEED] Kelas TI-3B berhasil dibuat.");
    }

    // 3. Assign Mahasiswa to Class
    if (mhs1User && classARecord) {
      const assignedA = await db.select().from(classStudents)
        .where(eq(classStudents.studentId, mhs1User.id))
        .limit(1);
      if (assignedA.length === 0) {
        await db.insert(classStudents).values({
          studentId: mhs1User.id,
          classId: classARecord.id,
        });
        console.log("[SEED] Mahasiswa Budi dihubungkan ke kelas TI-3A.");
      }
    }

    if (mhs2User && classBRecord) {
      const assignedB = await db.select().from(classStudents)
        .where(eq(classStudents.studentId, mhs2User.id))
        .limit(1);
      if (assignedB.length === 0) {
        await db.insert(classStudents).values({
          studentId: mhs2User.id,
          classId: classBRecord.id,
        });
        console.log("[SEED] Mahasiswa Siti dihubungkan ke kelas TI-3B.");
      }
    }

    // 4. Seed Courses
    if (dosenUser) {
      let course1 = await db.select().from(courses).where(eq(courses.code, "TI-PW")).limit(1);
      let course1Record = course1[0];
      if (!course1Record) {
        await db.insert(courses).values({
          name: "Pemrograman Web",
          code: "TI-PW",
          instructorId: dosenUser.id,
          icon: "Code",
          color: "blue",
        });
        const [newCourse1] = await db.select().from(courses).where(eq(courses.code, "TI-PW")).limit(1);
        course1Record = newCourse1;
        console.log("[SEED] Mata Kuliah Pemrograman Web berhasil dibuat.");
      }

      let course2 = await db.select().from(courses).where(eq(courses.code, "TI-BDL")).limit(1);
      let course2Record = course2[0];
      if (!course2Record) {
        await db.insert(courses).values({
          name: "Basis Data Lanjut",
          code: "TI-BDL",
          instructorId: dosenUser.id,
          icon: "Database",
          color: "purple",
        });
        const [newCourse2] = await db.select().from(courses).where(eq(courses.code, "TI-BDL")).limit(1);
        course2Record = newCourse2;
        console.log("[SEED] Mata Kuliah Basis Data Lanjut berhasil dibuat.");
      }

      // 5. Seed Sessions
      if (course1Record) {
        const existingSessions = await db.select().from(sessions).where(eq(sessions.courseId, course1Record.id)).limit(1);
        if (existingSessions.length === 0) {
          const now = new Date();
          const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
          await db.insert(sessions).values([
            {
              courseId: course1Record.id,
              title: "Pengenalan Arsitektur React & Komponen Modern",
              classGroup: "TI-3A",
              status: "live",
              startTime: now,
            },
            {
              courseId: course1Record.id,
              title: "State Management & React Hooks",
              classGroup: "TI-3A",
              status: "scheduled",
              startTime: futureDate,
            },
          ]);
          console.log("[SEED] Sesi perkuliahan Pemrograman Web berhasil dibuat.");
        }
      }

      if (course2Record) {
        const existingSessions2 = await db.select().from(sessions).where(eq(sessions.courseId, course2Record.id)).limit(1);
        if (existingSessions2.length === 0) {
          const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
          await db.insert(sessions).values([
            {
              courseId: course2Record.id,
              title: "Normalisasi Basis Data Relasional (1NF-BCNF)",
              classGroup: "TI-3A",
              status: "scheduled",
              startTime: tomorrow,
            },
          ]);
          console.log("[SEED] Sesi perkuliahan Basis Data Lanjut berhasil dibuat.");
        }
      }
    }

    // 6. Seed Reminders
    const existingReminders = await db.select().from(reminders).limit(1);
    if (existingReminders.length === 0) {
      await db.insert(reminders).values([
        {
          title: "Kerjakan tugas Basis Data",
          date: "2026-09-10",
          time: "23:59",
          classGroup: "TI-3A",
          status: "Aktif",
        },
        {
          title: "Kuis Pemrograman Web",
          date: "2026-09-12",
          time: "23:59",
          classGroup: "TI-3B",
          status: "Aktif",
        },
        {
          title: "Pengumpulan Laporan Praktikum",
          date: "2026-09-15",
          time: "23:59",
          classGroup: "Semua Kelas",
          status: "Aktif",
        },
      ]);
      console.log("[SEED] Data pengingat default berhasil dibuat.");
    }

    console.log("[SEED] Proses seeding database selesai.");
  } catch (err) {
    console.error("[SEED] Kesalahan saat menjalankan seeder:", err);
  }
}

// Eksekusi jika dipanggil langsung via node / tsx
if (process.argv[1] && (process.argv[1].endsWith("seed.ts") || process.argv[1].endsWith("seed.js"))) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}
