import { RequestHandler } from "express";
import { db } from "../db";
import { sessions, courses, users, classStudents, classes } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const handleGetDashboard: RequestHandler = async (req, res) => {
  const { userId, role } = req.query;
  try {
    let myClassNames: string[] = [];
    let isDosen = role === "dosen";

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

    const rawSessions = await db
      .select({
        sessionId: sessions.id,
        sessionTitle: sessions.title,
        status: sessions.status,
        startTime: sessions.startTime,
        courseName: courses.name,
        courseCode: courses.code,
        instructorName: users.name,
        instructorId: courses.instructorId,
        classGroup: sessions.classGroup,
      })
      .from(sessions)
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .leftJoin(users, eq(courses.instructorId, users.id))
      .orderBy(desc(sessions.startTime));

    const filteredSessions = rawSessions.filter(s => {
      if (isDosen) {
        // Di beranda dosen hanya tampil sesi dari user dosen tsb
        return s.instructorId === userId;
      }
      // Di mahasiswa: semua sesi dosen yang mempunyai sesi pada matkul terkait kelas mahasiswa tersebut
      if (!s.classGroup) return true;
      return myClassNames.includes(s.classGroup);
    });

    const formattedCourses = filteredSessions.map((s) => ({
      id: s.sessionId,
      name: `${s.courseName || 'Unknown'} - ${s.sessionTitle}`,
      instructor: s.instructorName || 'Unknown',
      icon: "ClipboardList",
      color: "from-blue-400 to-blue-600",
      status: s.status === "scheduled" ? "Akan datang" : s.status === "live" ? "LIVE" : "Selesai",
      rawStatus: s.status,
      startTime: s.startTime,
      time: s.startTime ? new Date(s.startTime).toLocaleString("id-ID") : "",
      code: s.courseCode,
      classGroup: s.classGroup,
    }));

    res.status(200).json({
      success: true,
      courses: formattedCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleGetCourses: RequestHandler = async (req, res) => {
  // Stub for now, can implement later if needed
  res.status(200).json({ success: true, courses: [] });
};

export const handleGetCourseById: RequestHandler<{ courseId: string }> = async (req, res) => {
  // Stub for now
  res.status(404).json({ success: false, message: "Course not found" });
};

export const handleGetCourseTranscripts: RequestHandler<{ courseId: string }> = async (req, res) => {
  // Stub for now
  res.status(200).json({ success: true, transcripts: [] });
};

export const handleGetMahasiswaSessionDetail: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    const session = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    if (!session.length) {
      return res.status(404).json({ success: false, message: "Sesi tidak ditemukan" });
    }

    const classGroup = session[0].classGroup;

    if (classGroup) {
      if (!userId) {
        return res.status(403).json({ success: false, message: "Akses ditolak" });
      }
      
      const myClasses = await db.select({ name: classes.name })
        .from(classStudents)
        .innerJoin(classes, eq(classStudents.classId, classes.id))
        .where(eq(classStudents.studentId, userId as string));
      
      const myClassNames = myClasses.map(c => c.name);
      
      if (!myClassNames.includes(classGroup)) {
        return res.status(403).json({ success: false, message: "Akses ditolak: Anda tidak terdaftar di kelas ini" });
      }
    }

    // Fetch course & instructor
    let courseName = "Mata Kuliah";
    let courseCode = "";
    let dosenName = "Dosen Pengampu";
    if (session[0].courseId) {
      const courseRes = await db
        .select({
          courseName: courses.name,
          courseCode: courses.code,
          dosenName: users.name
        })
        .from(courses)
        .leftJoin(users, eq(courses.instructorId, users.id))
        .where(eq(courses.id, session[0].courseId))
        .limit(1);

      if (courseRes.length) {
        courseName = courseRes[0].courseName;
        courseCode = courseRes[0].courseCode;
        dosenName = courseRes[0].dosenName || "Dosen Pengampu";
      }
    }

    // Fetch total students in class
    let totalStudents = 0;
    if (classGroup) {
      const targetClass = await db.select({ id: classes.id }).from(classes).where(eq(classes.name, classGroup)).limit(1);
      if (targetClass.length) {
        const studentsInClass = await db.select({ id: classStudents.id }).from(classStudents).where(eq(classStudents.classId, targetClass[0].id));
        totalStudents = studentsInClass.length;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...session[0],
        courseName,
        courseCode,
        dosenName,
        totalStudents
      }
    });

  } catch (error) {
    console.error("Error get mahasiswa session detail:", error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

