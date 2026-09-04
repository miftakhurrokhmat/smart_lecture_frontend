import { RequestHandler } from "express";
import { db } from "../db";
import { users, courses } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ==========================================
// USERS CRUD (Dosen & Mahasiswa)
// ==========================================
export const handleGetUsers: RequestHandler = async (req, res) => {
  const role = req.query.role as string;
  try {
    let query = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      identifier: users.identifier,
      prodi: users.prodi,
    }).from(users);
    
    if (role) {
      query = query.where(eq(users.role, role as any));
    }

    const data = await query;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error get users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleCreateUser: RequestHandler = async (req, res) => {
  const { name, email, password, role, identifier, prodi } = req.body;
  try {
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Email sudah terdaftar" });
    }

    const newUser = await db.insert(users).values({
      name, email, password, role, identifier, prodi
    }).returning();
    
    res.status(201).json({ success: true, data: newUser[0] });
  } catch (error) {
    console.error("Error create user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleDeleteUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.delete(users).where(eq(users.id, id));
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error delete user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==========================================
// COURSES CRUD
// ==========================================
export const handleGetAdminCourses: RequestHandler = async (req, res) => {
  try {
    const data = await db.select().from(courses);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleCreateCourse: RequestHandler = async (req, res) => {
  const { name, code, instructorId, color, icon } = req.body;
  try {
    const newCourse = await db.insert(courses).values({
      name, code, instructorId, color, icon
    }).returning();
    res.status(201).json({ success: true, data: newCourse[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==========================================
// STUDY PROGRAMS (PRODI) CRUD
// ==========================================
import { classes, classStudents, studyPrograms } from "../../drizzle/schema";
import { and, sql } from "drizzle-orm";

export const handleGetStudyPrograms: RequestHandler = async (req, res) => {
  try {
    const data = await db.select({
      id: studyPrograms.id,
      name: studyPrograms.name,
      code: studyPrograms.code,
      faculty: studyPrograms.faculty,
      description: studyPrograms.description,
      createdAt: studyPrograms.createdAt,
      classesCount: sql<number>`count(${classes.id})`.mapWith(Number)
    })
    .from(studyPrograms)
    .leftJoin(classes, eq(studyPrograms.id, classes.prodiId))
    .groupBy(studyPrograms.id);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error get study programs:", error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

export const handleCreateStudyProgram: RequestHandler = async (req, res) => {
  const { name, code, faculty, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ success: false, message: "Nama dan kode prodi wajib diisi." });
  }
  try {
    const newProdi = await db.insert(studyPrograms).values({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      faculty: faculty ? faculty.trim() : null,
      description: description ? description.trim() : null
    }).returning();
    res.status(201).json({ success: true, data: newProdi[0] });
  } catch (error) {
    console.error("Error create study program:", error);
    res.status(500).json({ success: false, message: "Gagal membuat program studi. Kemungkinan nama atau kode prodi sudah terdaftar." });
  }
};

export const handleUpdateStudyProgram: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { name, code, faculty, description } = req.body;
  try {
    const updated = await db.update(studyPrograms)
      .set({
        name: name ? name.trim() : undefined,
        code: code ? code.trim().toUpperCase() : undefined,
        faculty: faculty !== undefined ? faculty.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined
      })
      .where(eq(studyPrograms.id, id))
      .returning();
    res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("Error update study program:", error);
    res.status(500).json({ success: false, message: "Gagal memperbarui program studi" });
  }
};

export const handleDeleteStudyProgram: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const relatedClasses = await db.select().from(classes).where(eq(classes.prodiId, id)).limit(1);
    if (relatedClasses.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Program studi tidak dapat dihapus karena masih digunakan oleh kelas aktif."
      });
    }
    await db.delete(studyPrograms).where(eq(studyPrograms.id, id));
    res.status(200).json({ success: true, message: "Program studi berhasil dihapus" });
  } catch (error) {
    console.error("Error delete study program:", error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

// ==========================================
// CLASSES CRUD
// ==========================================
export const handleGetClasses: RequestHandler = async (req, res) => {
  try {
    const data = await db.select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      prodiId: classes.prodiId,
      prodi: classes.prodi,
      studentCount: sql<number>`count(${classStudents.studentId})`.mapWith(Number)
    })
    .from(classes)
    .leftJoin(classStudents, eq(classes.id, classStudents.classId))
    .groupBy(classes.id);
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

export const handleCreateClass: RequestHandler = async (req, res) => {
  const { name, description, prodiId, prodi } = req.body;
  if (!prodiId && !prodi) {
    return res.status(400).json({ success: false, message: "Program studi wajib dipilih saat membuat kelas baru." });
  }
  try {
    let prodiName = prodi;
    if (prodiId && !prodiName) {
      const p = await db.select().from(studyPrograms).where(eq(studyPrograms.id, prodiId)).limit(1);
      if (p[0]) prodiName = p[0].name;
    }

    const newCls = await db.insert(classes).values({
      name: name.trim(),
      description: description ? description.trim() : null,
      prodiId: prodiId || null,
      prodi: prodiName || null,
    }).returning();
    res.status(201).json({ success: true, data: newCls[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal membuat kelas. Kemungkinan nama kelas sudah terdaftar." });
  }
};

export const handleDeleteClass: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await db.delete(classes).where(eq(classes.id, id));
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

export const handleGetClassStudents: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    })
    .from(classStudents)
    .innerJoin(users, eq(classStudents.studentId, users.id))
    .where(eq(classStudents.classId, id));
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

export const handleAddClassStudent: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  try {
    await db.insert(classStudents).values({ classId: id, studentId });
    res.status(201).json({ success: true, message: "Added" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

export const handleRemoveClassStudent: RequestHandler = async (req, res) => {
  const { id, studentId } = req.params;
  try {
    await db.delete(classStudents).where(
      and(eq(classStudents.classId, id), eq(classStudents.studentId, studentId))
    );
    res.status(200).json({ success: true, message: "Removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};
