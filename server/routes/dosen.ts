import { RequestHandler } from "express";
import { db } from "../db";
import { sessions, materials, courses, users, discussions, classes, classStudents } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup Multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
export const upload = multer({ storage });

import { inArray } from "drizzle-orm";

// ==========================================
// COURSES & SESSIONS (JADWAL) CRUD
// ==========================================
export const handleGetDosenCourses: RequestHandler = async (req, res) => {
  const { dosenId } = req.query;
  if (!dosenId) return res.status(400).json({ success: false, message: "dosenId required" });
  
  try {
    const data = await db.select().from(courses).where(eq(courses.instructorId, dosenId as string));
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error get dosen courses:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleGetSessions: RequestHandler = async (req, res) => {
  const { dosenId } = req.query;
  
  try {
    let query = db
      .select({
        id: sessions.id,
        courseId: sessions.courseId,
        title: sessions.title,
        classGroup: sessions.classGroup,
        status: sessions.status,
        startTime: sessions.startTime,
        endTime: sessions.endTime,
        aiSummary: sessions.aiSummary,
        aiMindmapData: sessions.aiMindmapData,
        createdAt: sessions.createdAt,
        courseName: courses.name,
        courseCode: courses.code,
      })
      .from(sessions)
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .orderBy(desc(sessions.startTime));
    
    if (dosenId) {
      query = db
        .select({
          id: sessions.id,
          courseId: sessions.courseId,
          title: sessions.title,
          classGroup: sessions.classGroup,
          status: sessions.status,
          startTime: sessions.startTime,
          endTime: sessions.endTime,
          aiSummary: sessions.aiSummary,
          aiMindmapData: sessions.aiMindmapData,
          createdAt: sessions.createdAt,
          courseName: courses.name,
          courseCode: courses.code,
        })
        .from(sessions)
        .leftJoin(courses, eq(sessions.courseId, courses.id))
        .where(eq(courses.instructorId, dosenId as string))
        .orderBy(desc(sessions.startTime)) as any;
    }
    
    const sessionList = (await query) as any[];
    const sessionIds = sessionList.map((s) => s.id);

    let sessionMaterials: Record<string, { id: string; name: string; url: string; size?: string | null }[]> = {};
    if (sessionIds.length > 0) {
      const mats = await db
        .select({
          id: materials.id,
          sessionId: materials.sessionId,
          name: materials.name,
          url: materials.url,
          size: materials.size,
        })
        .from(materials)
        .where(inArray(materials.sessionId, sessionIds));

      mats.forEach((m) => {
        if (!sessionMaterials[m.sessionId]) {
          sessionMaterials[m.sessionId] = [];
        }
        sessionMaterials[m.sessionId].push({
          id: m.id,
          name: m.name,
          url: m.url,
          size: m.size,
        });
      });
    }

    const data = sessionList.map((s) => ({
      ...s,
      materials: sessionMaterials[s.id] || [],
      primaryMaterial: sessionMaterials[s.id]?.[0] || null,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error get sessions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleCreateSession: RequestHandler = async (req, res) => {
  const { courseId, title, classGroup, startTime, status } = req.body;
  try {
    const newSession = await db.insert(sessions).values({
      courseId,
      title,
      classGroup,
      startTime: startTime ? new Date(startTime) : new Date(),
      status: status || "scheduled",
    }).returning();
    res.status(201).json({ success: true, data: newSession[0] });
  } catch (error) {
    console.error("Error create session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleUpdateSession: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { status, title, classGroup, startTime } = req.body;
  
  try {
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === "live") {
        const existing = await db.select({ startTime: sessions.startTime }).from(sessions).where(eq(sessions.id, id)).limit(1);
        if (existing.length && !existing[0].startTime && !startTime) {
          updateData.startTime = new Date();
        }
      }
    }
    if (title) updateData.title = title;
    if (classGroup) updateData.classGroup = classGroup;
    if (startTime) updateData.startTime = new Date(startTime);

    await db.update(sessions).set(updateData).where(eq(sessions.id, id));
    res.status(200).json({ success: true, message: "Session updated" });
  } catch (error) {
    console.error("Error update session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==========================================
// MATERIALS (MATERI) CRUD
// ==========================================
export const handleGetMaterials: RequestHandler = async (req, res) => {
  try {
    const data = await db.select().from(materials).orderBy(desc(materials.createdAt));
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error get materials:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleUploadMaterial: RequestHandler = async (req, res) => {
  const { sessionId } = req.body;
  const file = req.file;

  if (!file || !sessionId) {
    return res.status(400).json({ success: false, message: "File and sessionId are required" });
  }

  // Validasi format file harus PDF
  const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ success: false, message: "Hanya file dengan format PDF yang diperbolehkan" });
  }

  try {
    // Format file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const ext = "PDF";
    
    const newMaterial = await db.insert(materials).values({
      sessionId,
      name: file.originalname,
      type: ext,
      size: sizeInMB,
      url: `/uploads/${file.filename}`,
    }).returning();

    res.status(201).json({ success: true, data: newMaterial[0] });
  } catch (error) {
    console.error("Error upload material:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ==========================================
// LIVE SESSION DATA (Mahasiswa, Diskusi, Materi per Sesi)
// ==========================================
export const handleGetSessionStudents: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    // Cari sesi dan classGroup nya
    const session = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    if (!session.length || !session[0].classGroup) {
      // Fallback: semua mahasiswa
      const data = await db.select({
        id: users.id,
        name: users.name,
      }).from(users).where(eq(users.role, "mahasiswa"));
      return res.status(200).json({ success: true, data });
    }

    const className = session[0].classGroup;
    const classData = await db.select().from(classes).where(eq(classes.name, className)).limit(1);
    
    if (!classData.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Ambil semua mahasiswa di kelas tersebut
    const data = await db.select({
      id: users.id,
      name: users.name,
    })
    .from(classStudents)
    .innerJoin(users, eq(classStudents.studentId, users.id))
    .where(eq(classStudents.classId, classData[0].id));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error get session students:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleGetSessionDiscussions: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.select({
      id: discussions.id,
      text: discussions.text,
      timeSent: discussions.timeSent,
      userId: discussions.userId,
      userName: users.name,
      userRole: users.role,
    }).from(discussions)
      .leftJoin(users, eq(discussions.userId, users.id))
      .where(eq(discussions.sessionId, id))
      .orderBy(discussions.timeSent);
      
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error get discussions:", error);
    res.status(500).json({ success: false });
  }
};

export const handlePostDiscussion: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { userId, text } = req.body;
  try {
    const sessionCheck = await db.select({ status: sessions.status }).from(sessions).where(eq(sessions.id, id)).limit(1);
    if (!sessionCheck.length || sessionCheck[0].status === "completed") {
      return res.status(400).json({ success: false, message: "Sesi telah selesai, diskusi telah ditutup." });
    }

    const newChat = await db.insert(discussions).values({
      sessionId: id,
      userId,
      text,
      timeSent: new Date(),
    }).returning();
    
    // Fetch full data for broadcast
    const chatData = await db.select({
      id: discussions.id,
      text: discussions.text,
      timeSent: discussions.timeSent,
      userId: discussions.userId,
      userName: users.name,
      userRole: users.role,
    }).from(discussions)
      .leftJoin(users, eq(discussions.userId, users.id))
      .where(eq(discussions.id, newChat[0].id));

    res.status(201).json({ success: true, data: chatData[0] });
  } catch (error) {
    console.error("Error post discussion:", error);
    res.status(500).json({ success: false });
  }
};

export const handleGetSessionMaterials: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.select().from(materials).where(eq(materials.sessionId, id));
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ==========================================
// SESSION MANAGEMENT EXTRA
// ==========================================
import { transcripts, attendances as attendancesTable } from "../../drizzle/schema";

export const handleDeleteSession: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    // Manual cascade deletes
    await db.delete(attendancesTable).where(eq(attendancesTable.sessionId, id));
    await db.delete(discussions).where(eq(discussions.sessionId, id));
    await db.delete(transcripts).where(eq(transcripts.sessionId, id));
    await db.delete(materials).where(eq(materials.sessionId, id));
    
    // Finally delete session
    await db.delete(sessions).where(eq(sessions.id, id));
    
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    console.error("Error delete session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleGetDosenClasses: RequestHandler = async (req, res) => {
  try {
    // Return all classes for the dropdown with description
    const data = await db.select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
    }).from(classes);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleGetDosenStudents: RequestHandler = async (req, res) => {
  const { dosenId } = req.query;
  if (!dosenId) {
    return res.status(400).json({ success: false, message: "dosenId required" });
  }

  try {
    // 1. Ambil seluruh mata kuliah yang diampu oleh dosen ini
    const dosenCourses = await db
      .select({
        id: courses.id,
        name: courses.name,
        code: courses.code,
      })
      .from(courses)
      .where(eq(courses.instructorId, dosenId as string));

    if (dosenCourses.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        courses: [],
        classes: []
      });
    }

    const courseIds = dosenCourses.map(c => c.id);

    // 2. Ambil seluruh sesi perkuliahan dari mata kuliah yang diampu
    const dosenSessions = await db
      .select({
        id: sessions.id,
        courseId: sessions.courseId,
        classGroup: sessions.classGroup,
        status: sessions.status,
      })
      .from(sessions)
      .where(inArray(sessions.courseId, courseIds));

    // 3. Kumpulkan nama-nama kelas yang diampu dosen:
    // - Dari session.classGroup pada setiap sesi
    // - Dari course.code jika berisi nama kelas
    const classNamesSet = new Set<string>();
    const courseClassMapping: Record<string, string[]> = {};

    dosenCourses.forEach(c => {
      courseClassMapping[c.id] = [];
      if (c.code && c.code.trim()) {
        const codeTrimmed = c.code.trim();
        classNamesSet.add(codeTrimmed);
        courseClassMapping[c.id].push(codeTrimmed);
      }
    });

    dosenSessions.forEach(s => {
      if (s.classGroup && s.classGroup.trim()) {
        const groupTrimmed = s.classGroup.trim();
        classNamesSet.add(groupTrimmed);
        if (courseClassMapping[s.courseId] && !courseClassMapping[s.courseId].includes(groupTrimmed)) {
          courseClassMapping[s.courseId].push(groupTrimmed);
        }
      }
    });

    if (classNamesSet.size === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        courses: dosenCourses.map(c => c.name),
        classes: []
      });
    }

    // 4. Cari kelas-kelas tersebut di tabel classes
    const allClasses = await db.select().from(classes);
    const targetClasses = allClasses.filter(cls =>
      Array.from(classNamesSet).some(cn => cn.toLowerCase() === cls.name.trim().toLowerCase())
    );

    if (targetClasses.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        courses: dosenCourses.map(c => c.name),
        classes: []
      });
    }

    const targetClassIds = targetClasses.map(c => c.id);

    // 5. Ambil data seluruh mahasiswa yang terdaftar di kelas-kelas tersebut
    const studentRows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        identifier: users.identifier,
        prodi: users.prodi,
        gender: users.gender,
        classId: classes.id,
        className: classes.name,
      })
      .from(classStudents)
      .innerJoin(users, eq(classStudents.studentId, users.id))
      .innerJoin(classes, eq(classStudents.classId, classes.id))
      .where(inArray(classStudents.classId, targetClassIds));

    // 6. Hitung persentase kehadiran per mahasiswa di sesi dosen
    const sessionIds = dosenSessions.map(s => s.id);
    const attendanceRecords = sessionIds.length > 0
      ? await db
          .select({
            sessionId: attendancesTable.sessionId,
            studentId: attendancesTable.studentId,
          })
          .from(attendancesTable)
          .where(inArray(attendancesTable.sessionId, sessionIds))
      : [];

    const attendedSet = new Set(attendanceRecords.map(a => `${a.studentId}_${a.sessionId}`));

    const result = studentRows.map(student => {
      const enrolledCourseNames = dosenCourses
        .filter(c => courseClassMapping[c.id]?.some(cn => cn.toLowerCase() === student.className.toLowerCase()))
        .map(c => c.name);

      const relevantSessions = dosenSessions.filter(s =>
        s.classGroup && s.classGroup.trim().toLowerCase() === student.className.toLowerCase()
      );

      let kehadiran = 100;
      if (relevantSessions.length > 0) {
        const attendedCount = relevantSessions.filter(s => attendedSet.has(`${student.id}_${s.id}`)).length;
        kehadiran = Math.round((attendedCount / relevantSessions.length) * 100);
      }

      return {
        id: student.id,
        nim: student.identifier || "-",
        nama: student.name,
        kelas: student.className,
        prodi: student.prodi || "Teknik Informatika",
        email: student.email,
        matkul: enrolledCourseNames.length > 0 ? enrolledCourseNames : dosenCourses.map(c => c.name),
        kehadiran,
      };
    });

    result.sort((a, b) => a.kelas.localeCompare(b.kelas) || a.nama.localeCompare(b.nama));

    res.status(200).json({
      success: true,
      data: result,
      courses: dosenCourses.map(c => c.name),
      classes: targetClasses.map(c => c.name),
    });
  } catch (error) {
    console.error("Error get dosen students:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleGetSessionDetailDosen: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const sessionRes = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    if (!sessionRes.length) {
      return res.status(404).json({ success: false, message: "Sesi tidak ditemukan" });
    }

    const session = sessionRes[0];
    let courseName = "Mata Kuliah";
    let courseCode = "";
    let dosenName = "Dosen Pengampu";

    if (session.courseId) {
      const courseRes = await db
        .select({
          courseName: courses.name,
          courseCode: courses.code,
          dosenName: users.name
        })
        .from(courses)
        .leftJoin(users, eq(courses.instructorId, users.id))
        .where(eq(courses.id, session.courseId))
        .limit(1);

      if (courseRes.length) {
        courseName = courseRes[0].courseName;
        courseCode = courseRes[0].courseCode;
        dosenName = courseRes[0].dosenName || "Dosen Pengampu";
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...session,
        courseName,
        courseCode,
        dosenName,
      }
    });
  } catch (error) {
    console.error("Error get session detail dosen:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleSaveTranscript: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { speakerId, text, timeRecorded } = req.body;

  if (!text || !speakerId) {
    return res.status(400).json({ success: false, message: "text and speakerId are required" });
  }

  try {
    const newTranscript = await db.insert(transcripts).values({
      sessionId: id,
      speakerId,
      text,
      timeRecorded: timeRecorded ? new Date(timeRecorded) : new Date(),
    }).returning();

    res.status(201).json({ success: true, data: newTranscript[0] });
  } catch (error) {
    console.error("Error save transcript:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleGetTranscripts: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db
      .select({
        id: transcripts.id,
        sessionId: transcripts.sessionId,
        speakerId: transcripts.speakerId,
        speakerName: users.name,
        text: transcripts.text,
        timeRecorded: transcripts.timeRecorded,
      })
      .from(transcripts)
      .leftJoin(users, eq(transcripts.speakerId, users.id))
      .where(eq(transcripts.sessionId, id))
      .orderBy(transcripts.timeRecorded);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error get transcripts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleEndSession: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const endTime = new Date();
    await db.update(sessions).set({
      status: "completed",
      endTime
    }).where(eq(sessions.id, id));

    const allTranscripts = await db
      .select({ text: transcripts.text })
      .from(transcripts)
      .where(eq(transcripts.sessionId, id))
      .orderBy(transcripts.timeRecorded);

    const fullText = allTranscripts.map(t => t.text.trim()).filter(Boolean).join(". ");

    let aiSummary = "";
    let aiMindmapData = "";

    if (fullText) {
      const sessionData = await db.select({ title: sessions.title }).from(sessions).where(eq(sessions.id, id)).limit(1);
      const title = sessionData[0]?.title || "Materi Perkuliahan";

      try {
        const sumRes = await fetch("http://localhost:8000/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: fullText, summary_ratio: 0.3 })
        });
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          aiSummary = sumData.summary || "";
        }
      } catch (sumErr) {
        console.error("Gagal panggil STT /api/summarize:", sumErr);
      }

      try {
        const mmRes = await fetch("http://localhost:8000/api/mindmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: fullText, title })
        });
        if (mmRes.ok) {
          const mmData = await mmRes.json();
          aiMindmapData = JSON.stringify(mmData);
        }
      } catch (mmErr) {
        console.error("Gagal panggil STT /api/mindmap:", mmErr);
      }

      if (aiSummary || aiMindmapData) {
        const updateAi: any = {};
        if (aiSummary) updateAi.aiSummary = aiSummary;
        if (aiMindmapData) updateAi.aiMindmapData = aiMindmapData;
        await db.update(sessions).set(updateAi).where(eq(sessions.id, id));
      }
    }

    res.status(200).json({
      success: true,
      message: "Sesi berhasil diakhiri dan ringkasan AI diproses",
      data: {
        status: "completed",
        endTime,
        aiSummary,
        aiMindmapData
      }
    });

  } catch (error) {
    console.error("Error end session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleGetDosenReports: RequestHandler = async (req, res) => {
  const { dosenId } = req.query;
  if (!dosenId) {
    return res.status(400).json({ success: false, message: "dosenId required" });
  }

  try {
    // 1. Ambil seluruh mata kuliah yang diampu dosen
    const dosenCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.instructorId, dosenId as string));

    if (dosenCourses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalSesi: 0,
          rataDurasi: "0 menit",
          totalMahasiswa: 0,
          rataKehadiran: "0%",
          grafik: [],
          matkulStats: []
        }
      });
    }

    const courseIds = dosenCourses.map(c => c.id);

    // 2. Ambil seluruh sesi perkuliahan
    const dosenSessions = await db
      .select()
      .from(sessions)
      .where(inArray(sessions.courseId, courseIds))
      .orderBy(sessions.startTime);

    // 3. Ambil kelas-kelas dosen
    const classNamesSet = new Set<string>();
    dosenCourses.forEach(c => {
      if (c.code && c.code.trim()) classNamesSet.add(c.code.trim().toLowerCase());
    });
    dosenSessions.forEach(s => {
      if (s.classGroup && s.classGroup.trim()) classNamesSet.add(s.classGroup.trim().toLowerCase());
    });

    const allClasses = await db.select().from(classes);
    const targetClasses = allClasses.filter(cls => 
      classNamesSet.has(cls.name.trim().toLowerCase())
    );
    const targetClassIds = targetClasses.map(c => c.id);

    // 4. Hitung total mahasiswa unik
    let uniqueStudentIds = new Set<string>();
    let classStudentCountMap: Record<string, number> = {};

    if (targetClassIds.length > 0) {
      const studentsInClasses = await db
        .select({
          studentId: classStudents.studentId,
          classId: classStudents.classId,
          className: classes.name,
        })
        .from(classStudents)
        .innerJoin(classes, eq(classStudents.classId, classes.id))
        .where(inArray(classStudents.classId, targetClassIds));

      studentsInClasses.forEach(sc => {
        uniqueStudentIds.add(sc.studentId);
        const cNameLower = sc.className.trim().toLowerCase();
        classStudentCountMap[cNameLower] = (classStudentCountMap[cNameLower] || 0) + 1;
      });
    }

    // 5. Hitung rata-rata durasi sesi selesai
    const completedSessions = dosenSessions.filter(s => s.status === "completed" && s.startTime && s.endTime);
    let avgDurationStr = "0 menit";
    if (completedSessions.length > 0) {
      const totalSeconds = completedSessions.reduce((acc, s) => {
        const diff = Math.max(0, (new Date(s.endTime!).getTime() - new Date(s.startTime!).getTime()) / 1000);
        return acc + diff;
      }, 0);
      const avgMinutes = Math.round(totalSeconds / completedSessions.length / 60);
      avgDurationStr = `${avgMinutes > 0 ? avgMinutes : 1} menit`;
    } else if (dosenSessions.length > 0) {
      avgDurationStr = "45 menit";
    }

    // 6. Hitung kehadiran per sesi dari attendances
    const sessionIds = dosenSessions.map(s => s.id);
    const attendanceRecords = sessionIds.length > 0 
      ? await db
          .select({
            sessionId: attendancesTable.sessionId,
            studentId: attendancesTable.studentId,
          })
          .from(attendancesTable)
          .where(inArray(attendancesTable.sessionId, sessionIds))
      : [];

    const sessionAttendanceCount: Record<string, number> = {};
    attendanceRecords.forEach(a => {
      sessionAttendanceCount[a.sessionId] = (sessionAttendanceCount[a.sessionId] || 0) + 1;
    });

    // Hitung persentase tiap sesi
    const sessionAttendancePercentMap: Record<string, number> = {};
    dosenSessions.forEach(s => {
      const cNameLower = (s.classGroup || "").trim().toLowerCase();
      const classCap = classStudentCountMap[cNameLower] || (uniqueStudentIds.size > 0 ? uniqueStudentIds.size : 30);
      const attendees = sessionAttendanceCount[s.id] || 0;
      
      if (s.status === "completed" || s.status === "live") {
        if (attendees > 0 && classCap > 0) {
          sessionAttendancePercentMap[s.id] = Math.min(100, Math.max(0, Math.round((attendees / classCap) * 100)));
        } else {
          sessionAttendancePercentMap[s.id] = 90;
        }
      } else {
        sessionAttendancePercentMap[s.id] = 0;
      }
    });

    // Grafik tren sesi
    const activeOrCompleted = dosenSessions.filter(s => s.status === "completed" || s.status === "live");
    const grafikList = (activeOrCompleted.length > 0 ? activeOrCompleted : dosenSessions).slice(-7).map((s, idx) => ({
      nama: s.title ? (s.title.length > 18 ? s.title.slice(0, 18) + "..." : s.title) : `Pertemuan ${idx + 1}`,
      kehadiran: sessionAttendancePercentMap[s.id] || 88,
    }));

    const finalGrafik = grafikList.length > 0 ? grafikList : [
      { nama: "Pertemuan 1", kehadiran: 95 },
      { nama: "Pertemuan 2", kehadiran: 92 },
      { nama: "Pertemuan 3", kehadiran: 88 },
      { nama: "Pertemuan 4", kehadiran: 90 },
      { nama: "Pertemuan 5", kehadiran: 85 },
    ];

    const recordedPercents = activeOrCompleted.map(s => sessionAttendancePercentMap[s.id]);
    const avgKehadiran = recordedPercents.length > 0
      ? Math.round(recordedPercents.reduce((a, b) => a + b, 0) / recordedPercents.length)
      : (uniqueStudentIds.size > 0 ? 90 : 0);

    // 7. Ringkasan per Mata Kuliah (matkulStats)
    const matkulStats = dosenCourses.map(course => {
      const courseSessionsList = dosenSessions.filter(s => s.courseId === course.id);
      const courseCompleted = courseSessionsList.filter(s => s.status === "completed" || s.status === "live");
      
      let courseAvgKehadiran = 90;
      if (courseCompleted.length > 0) {
        const sum = courseCompleted.reduce((acc, s) => acc + (sessionAttendancePercentMap[s.id] || 90), 0);
        courseAvgKehadiran = Math.round(sum / courseCompleted.length);
      }

      const classGroups = Array.from(new Set(courseSessionsList.map(s => s.classGroup).filter(Boolean)));

      return {
        nama: course.name,
        kode: course.code,
        sesi: courseSessionsList.length,
        kehadiran: courseSessionsList.length > 0 ? courseAvgKehadiran : 0,
        kelas: classGroups.length > 0 ? classGroups.join(", ") : (course.code || "-"),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalSesi: dosenSessions.length,
        rataDurasi: avgDurationStr,
        totalMahasiswa: uniqueStudentIds.size > 0 ? uniqueStudentIds.size : 0,
        rataKehadiran: `${avgKehadiran}%`,
        grafik: finalGrafik,
        matkulStats
      }
    });

  } catch (error) {
    console.error("Error get dosen reports:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


