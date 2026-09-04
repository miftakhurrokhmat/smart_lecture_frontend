import { RequestHandler } from "express";
import { db } from "../db";
import { discussions, sessions, courses, users, classStudents, classes } from "../../drizzle/schema";
import { eq, desc, asc, and, isNull, isNotNull, inArray, or } from "drizzle-orm";

export const handleGetDiscussionOptions: RequestHandler = async (req, res) => {
  const { userId, role } = req.query;
  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required" });
  }

  try {
    // Ambil seluruh mata kuliah untuk opsi filter umum
    const allCourses = await db
      .select({ id: courses.id, name: courses.name, code: courses.code })
      .from(courses)
      .orderBy(courses.name);

    let classCoursesWithOptions: {
      courseId: string;
      courseName: string;
      courseCode: string;
      sessions: {
        sessionId: string;
        title: string;
        classGroup: string;
        status: string;
        startTime: Date | null;
      }[];
    }[] = [];

    if (role === "dosen") {
      // Dosen: hanya mata kuliah yang diampu dosen
      const dosenCourses = await db
        .select({ id: courses.id, name: courses.name, code: courses.code })
        .from(courses)
        .where(eq(courses.instructorId, userId as string));

      const courseIds = dosenCourses.map(c => c.id);

      const eligibleSessions = courseIds.length > 0
        ? await db
            .select({
              id: sessions.id,
              courseId: sessions.courseId,
              title: sessions.title,
              classGroup: sessions.classGroup,
              status: sessions.status,
              startTime: sessions.startTime,
            })
            .from(sessions)
            .where(
              and(
                inArray(sessions.courseId, courseIds),
                or(eq(sessions.status, "live"), eq(sessions.status, "completed"))
              )
            )
            .orderBy(desc(sessions.startTime))
        : [];

      classCoursesWithOptions = dosenCourses.map(c => ({
        courseId: c.id,
        courseName: c.name,
        courseCode: c.code,
        sessions: eligibleSessions
          .filter(s => s.courseId === c.id)
          .map(s => ({
            sessionId: s.id,
            title: s.title,
            classGroup: s.classGroup || "-",
            status: s.status,
            startTime: s.startTime,
          })),
      }));
    } else {
      // Mahasiswa: HANYA mata kuliah dan sesi yang di-assign ke kelas mahasiswa tersebut
      const myClasses = await db
        .select({ name: classes.name })
        .from(classStudents)
        .innerJoin(classes, eq(classStudents.classId, classes.id))
        .where(eq(classStudents.studentId, userId as string));

      const myClassNames = myClasses.map(c => c.name.trim().toLowerCase());

      if (myClassNames.length > 0) {
        // Ambil semua sesi yang statusnya live atau completed
        const eligibleSessions = await db
          .select({
            id: sessions.id,
            courseId: sessions.courseId,
            title: sessions.title,
            classGroup: sessions.classGroup,
            status: sessions.status,
            startTime: sessions.startTime,
            courseName: courses.name,
            courseCode: courses.code,
          })
          .from(sessions)
          .innerJoin(courses, eq(sessions.courseId, courses.id))
          .where(or(eq(sessions.status, "live"), eq(sessions.status, "completed")))
          .orderBy(desc(sessions.startTime));

        // Filter ketat: Hanya sesi yang classGroup-nya sesuai dengan kelas mahasiswa
        const myClassSessions = eligibleSessions.filter(s =>
          s.classGroup && myClassNames.includes(s.classGroup.trim().toLowerCase())
        );

        // Petakan ke grup mata kuliah
        const courseMap = new Map<string, { id: string; name: string; code: string; sessions: any[] }>();

        myClassSessions.forEach(s => {
          if (!courseMap.has(s.courseId)) {
            courseMap.set(s.courseId, {
              id: s.courseId,
              name: s.courseName,
              code: s.courseCode,
              sessions: [],
            });
          }
          courseMap.get(s.courseId)!.sessions.push({
            sessionId: s.id,
            title: s.title,
            classGroup: s.classGroup,
            status: s.status,
            startTime: s.startTime,
          });
        });

        classCoursesWithOptions = Array.from(courseMap.values()).map(c => ({
          courseId: c.id,
          courseName: c.name,
          courseCode: c.code,
          sessions: c.sessions,
        }));
      } else {
        // Mahasiswa belum terdaftar di kelas manapun
        classCoursesWithOptions = [];
      }
    }

    res.status(200).json({
      success: true,
      data: classCoursesWithOptions,
      allCourses,
    });
  } catch (error) {
    console.error("Error get discussion options:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleGetDiscussions: RequestHandler = async (req, res) => {
  const { courseId, sessionId, filter } = req.query;

  try {
    let threads = await db
      .select({
        id: discussions.id,
        sessionId: discussions.sessionId,
        userId: discussions.userId,
        title: discussions.title,
        text: discussions.text,
        isAnswered: discussions.isAnswered,
        timeSent: discussions.timeSent,
        createdAt: discussions.createdAt,
        authorName: users.name,
        authorRole: users.role,
        authorEmail: users.email,
        sessionTitle: sessions.title,
        sessionStatus: sessions.status,
        sessionClassGroup: sessions.classGroup,
        courseId: courses.id,
        courseName: courses.name,
        courseCode: courses.code,
      })
      .from(discussions)
      .leftJoin(users, eq(discussions.userId, users.id))
      .leftJoin(sessions, eq(discussions.sessionId, sessions.id))
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .where(and(isNull(discussions.parentId), isNotNull(discussions.title)))
      .orderBy(desc(discussions.timeSent));

    if (courseId && typeof courseId === "string" && courseId !== "all") {
      threads = threads.filter(t => t.courseId === courseId);
    }
    if (sessionId && typeof sessionId === "string" && sessionId !== "all") {
      threads = threads.filter(t => t.sessionId === sessionId);
    }
    if (filter === "unanswered") {
      threads = threads.filter(t => !t.isAnswered);
    } else if (filter === "answered") {
      threads = threads.filter(t => t.isAnswered);
    }

    const threadIds = threads.map(t => t.id);

    let allReplies: any[] = [];
    if (threadIds.length > 0) {
      allReplies = await db
        .select({
          id: discussions.id,
          parentId: discussions.parentId,
          sessionId: discussions.sessionId,
          userId: discussions.userId,
          text: discussions.text,
          timeSent: discussions.timeSent,
          createdAt: discussions.createdAt,
          authorName: users.name,
          authorRole: users.role,
          authorEmail: users.email,
        })
        .from(discussions)
        .leftJoin(users, eq(discussions.userId, users.id))
        .where(inArray(discussions.parentId, threadIds))
        .orderBy(asc(discussions.timeSent));
    }

    const repliesByParent: Record<string, any[]> = {};
    allReplies.forEach(r => {
      if (r.parentId) {
        if (!repliesByParent[r.parentId]) repliesByParent[r.parentId] = [];
        repliesByParent[r.parentId].push({
          id: r.id,
          text: r.text,
          timeSent: r.timeSent,
          author: {
            id: r.userId,
            name: r.authorName || "Pengguna",
            role: r.authorRole || "mahasiswa",
            email: r.authorEmail,
          },
        });
      }
    });

    const data = threads.map(t => {
      const threadReplies = repliesByParent[t.id] || [];
      return {
        id: t.id,
        title: t.title || "Topik Diskusi",
        text: t.text,
        isAnswered: t.isAnswered || threadReplies.length > 0,
        timeSent: t.timeSent,
        createdAt: t.createdAt,
        author: {
          id: t.userId,
          name: t.authorName || "Pengguna",
          role: t.authorRole || "mahasiswa",
          email: t.authorEmail,
        },
        session: {
          id: t.sessionId,
          title: t.sessionTitle || "Sesi",
          status: t.sessionStatus || "completed",
          classGroup: t.sessionClassGroup || "-",
        },
        course: {
          id: t.courseId,
          name: t.courseName || "Mata Kuliah",
          code: t.courseCode || "-",
        },
        repliesCount: threadReplies.length,
        replies: threadReplies,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error get discussions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleCreateDiscussion: RequestHandler = async (req, res) => {
  const { userId, sessionId, title, text } = req.body;
  if (!userId || !sessionId || !title?.trim() || !text?.trim()) {
    return res.status(400).json({
      success: false,
      message: "userId, sessionId, title, dan text wajib diisi",
    });
  }

  try {
    // Validasi izin kelas jika pengguna adalah mahasiswa
    const userRow = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    if (userRow.length && userRow[0].role === "mahasiswa") {
      const sessionRow = await db
        .select({ classGroup: sessions.classGroup, status: sessions.status })
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (!sessionRow.length) {
        return res.status(404).json({ success: false, message: "Sesi perkuliahan tidak ditemukan." });
      }

      if (sessionRow[0].status !== "live" && sessionRow[0].status !== "completed") {
        return res.status(400).json({ success: false, message: "Hanya sesi yang sudah berjalan atau selesai yang dapat diajukan diskusi." });
      }

      const myClasses = await db
        .select({ name: classes.name })
        .from(classStudents)
        .innerJoin(classes, eq(classStudents.classId, classes.id))
        .where(eq(classStudents.studentId, userId));

      const myClassNames = myClasses.map(c => c.name.trim().toLowerCase());
      const sessionClass = (sessionRow[0].classGroup || "").trim().toLowerCase();

      if (!sessionClass || !myClassNames.includes(sessionClass)) {
        return res.status(403).json({
          success: false,
          message: "Anda hanya dapat mengajukan diskusi pada mata kuliah dan sesi kelas Anda sendiri.",
        });
      }
    }

    const newThread = await db
      .insert(discussions)
      .values({
        sessionId,
        userId,
        title: title.trim(),
        text: text.trim(),
        parentId: null,
        isAnswered: false,
        timeSent: new Date(),
      })
      .returning();

    const fullThread = await db
      .select({
        id: discussions.id,
        sessionId: discussions.sessionId,
        userId: discussions.userId,
        title: discussions.title,
        text: discussions.text,
        isAnswered: discussions.isAnswered,
        timeSent: discussions.timeSent,
        createdAt: discussions.createdAt,
        authorName: users.name,
        authorRole: users.role,
        sessionTitle: sessions.title,
        sessionStatus: sessions.status,
        sessionClassGroup: sessions.classGroup,
        courseId: courses.id,
        courseName: courses.name,
        courseCode: courses.code,
      })
      .from(discussions)
      .leftJoin(users, eq(discussions.userId, users.id))
      .leftJoin(sessions, eq(discussions.sessionId, sessions.id))
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .where(eq(discussions.id, newThread[0].id));

    res.status(201).json({
      success: true,
      data: {
        id: fullThread[0].id,
        title: fullThread[0].title,
        text: fullThread[0].text,
        isAnswered: false,
        timeSent: fullThread[0].timeSent,
        author: {
          id: fullThread[0].userId,
          name: fullThread[0].authorName,
          role: fullThread[0].authorRole,
        },
        session: {
          id: fullThread[0].sessionId,
          title: fullThread[0].sessionTitle,
          status: fullThread[0].sessionStatus,
          classGroup: fullThread[0].sessionClassGroup,
        },
        course: {
          id: fullThread[0].courseId,
          name: fullThread[0].courseName,
          code: fullThread[0].courseCode,
        },
        repliesCount: 0,
        replies: [],
      },
    });
  } catch (error) {
    console.error("Error create discussion:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleReplyDiscussion: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { userId, text } = req.body;

  if (!userId || !text?.trim()) {
    return res.status(400).json({
      success: false,
      message: "userId dan text wajib diisi",
    });
  }

  try {
    const parentThread = await db
      .select()
      .from(discussions)
      .where(eq(discussions.id, id))
      .limit(1);

    if (parentThread.length === 0) {
      return res.status(404).json({ success: false, message: "Diskusi tidak ditemukan" });
    }

    const newReply = await db
      .insert(discussions)
      .values({
        sessionId: parentThread[0].sessionId,
        userId,
        parentId: id,
        text: text.trim(),
        timeSent: new Date(),
      })
      .returning();

    await db
      .update(discussions)
      .set({ isAnswered: true })
      .where(eq(discussions.id, id));

    const replyAuthor = await db
      .select({ id: users.id, name: users.name, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    res.status(201).json({
      success: true,
      data: {
        id: newReply[0].id,
        text: newReply[0].text,
        timeSent: newReply[0].timeSent,
        author: replyAuthor[0] || { id: userId, name: "Pengguna", role: "mahasiswa" },
      },
    });
  } catch (error) {
    console.error("Error reply discussion:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
