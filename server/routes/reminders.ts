import { RequestHandler } from "express";
import { db } from "../db";
import { reminders, classes, classStudents, users } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function seedDefaultRemindersIfEmpty() {
  try {
    const existing = await db.select().from(reminders).limit(1);
    if (existing.length === 0) {
      await db.insert(reminders).values([
        {
          title: "Kerjakan tugas Basis Data",
          date: "2024-05-20",
          time: "23:59",
          classGroup: "TI-3A",
          status: "Aktif",
        },
        {
          title: "Kuis Pemrograman Web",
          date: "2024-05-22",
          time: "23:59",
          classGroup: "TI-3B",
          status: "Aktif",
        },
        {
          title: "Pengumpulan Laporan Praktikum",
          date: "2024-05-25",
          time: "23:59",
          classGroup: "Semua Kelas",
          status: "Aktif",
        },
      ]);
    }
  } catch (err) {
    console.error("Seed reminders error:", err);
  }
}

// Jalankan seed awal jika belum ada
seedDefaultRemindersIfEmpty();

export const handleGetReminders: RequestHandler = async (req, res) => {
  const { userId, role } = req.query;

  try {
    let isDosen = role === "dosen";
    let myClassNames: string[] = [];

    if (userId) {
      const userRecord = await db.select().from(users).where(eq(users.id, userId as string)).limit(1);
      if (userRecord.length > 0) {
        if (userRecord[0].role === "dosen") {
          isDosen = true;
        } else if (userRecord[0].role === "mahasiswa") {
          isDosen = false;
        }
      }

      if (!isDosen) {
        const myClasses = await db.select({ name: classes.name })
          .from(classStudents)
          .innerJoin(classes, eq(classStudents.classId, classes.id))
          .where(eq(classStudents.studentId, userId as string));
        myClassNames = myClasses.map(c => c.name);
      }
    }

    const allReminders = await db.select().from(reminders).orderBy(desc(reminders.createdAt));

    let filteredReminders = allReminders;
    if (isDosen) {
      // Dosen melihat seluruh pengingat
      filteredReminders = allReminders;
    } else {
      // Mahasiswa HANYA melihat pengingat yang ditujukan untuk kelasnya atau Semua Kelas
      filteredReminders = allReminders.filter(r => {
        if (!r.classGroup || r.classGroup === "Semua Kelas") return true;
        return myClassNames.includes(r.classGroup);
      });
    }

    res.status(200).json({
      success: true,
      data: filteredReminders,
    });
  } catch (error) {
    console.error("Error get reminders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleCreateReminder: RequestHandler = async (req, res) => {
  const { title, date, time, classGroup, instructorId, status } = req.body;

  if (!title || !date || !classGroup) {
    return res.status(400).json({ success: false, message: "Judul, tanggal, dan kelas wajib diisi" });
  }

  try {
    const newReminder = await db.insert(reminders).values({
      title: title.trim(),
      date,
      time: time ? time.trim() : "23:59",
      classGroup: classGroup.trim(),
      instructorId: instructorId || null,
      status: status || "Aktif",
    }).returning();

    res.status(201).json({ success: true, data: newReminder[0] });
  } catch (error) {
    console.error("Error create reminder:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleUpdateReminder: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { title, date, time, classGroup, status } = req.body;

  try {
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time ? time.trim() : "23:59";
    if (classGroup !== undefined) updateData.classGroup = classGroup.trim();
    if (status !== undefined) updateData.status = status;

    const updated = await db.update(reminders).set(updateData).where(eq(reminders.id, id)).returning();
    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: "Pengingat tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("Error update reminder:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleDeleteReminder: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(reminders).where(eq(reminders.id, id));
    res.status(200).json({ success: true, message: "Pengingat berhasil dihapus" });
  } catch (error) {
    console.error("Error delete reminder:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
