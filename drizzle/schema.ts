import { pgTable, serial, text, timestamp, boolean, integer, pgEnum, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "dosen", "mahasiswa"]);
export const sessionStatusEnum = pgEnum("session_status", ["scheduled", "live", "completed"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("mahasiswa"),
  identifier: text("identifier"), // NIM untuk mahasiswa, NIP/NIDN untuk dosen
  prodi: text("prodi"),
  gender: text("gender"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // Contoh: TI-3A
  instructorId: uuid("instructor_id").references(() => users.id).notNull(),
  icon: text("icon").notNull().default("BookOpen"),
  color: text("color").notNull().default("purple"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  studentId: uuid("student_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(), // Topik Sesi
  classGroup: text("class_group"), // Contoh: TI-3A
  status: sessionStatusEnum("status").notNull().default("scheduled"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  aiSummary: text("ai_summary"),
  aiMindmapData: text("ai_mindmap_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const materials = pgTable("materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => sessions.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // pdf, doc, dll
  size: text("size"), 
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const transcripts = pgTable("transcripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => sessions.id).notNull(),
  speakerId: uuid("speaker_id").references(() => users.id).notNull(), // Siapa yang ngomong
  text: text("text").notNull(),
  timeRecorded: timestamp("time_recorded", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const discussions = pgTable("discussions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => sessions.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  parentId: uuid("parent_id"),
  title: text("title"),
  text: text("text").notNull(),
  isAnswered: boolean("is_answered").default(false).notNull(),
  timeSent: timestamp("time_sent", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const attendances = pgTable("attendances", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => sessions.id).notNull(),
  studentId: uuid("student_id").references(() => users.id).notNull(),
  joinTime: timestamp("join_time", { withTimezone: true }).defaultNow().notNull(),
  leaveTime: timestamp("leave_time", { withTimezone: true }),
});

export const studyPrograms = pgTable("study_programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // Contoh: "Teknik Informatika"
  code: text("code").notNull().unique(), // Contoh: "TI"
  faculty: text("faculty"), // Contoh: "Fakultas Ilmu Komputer"
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // Contoh: "TI-3A"
  description: text("description"),
  prodiId: uuid("prodi_id").references(() => studyPrograms.id, { onDelete: 'set null' }),
  prodi: text("prodi"), // Nama prodi tersimpan langsung untuk performa dan kemudahan query
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const classStudents = pgTable("class_students", {
  id: uuid("id").primaryKey().defaultRandom(),
  classId: uuid("class_id").references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  studentId: uuid("student_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reminders = pgTable("reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  classGroup: text("class_group").notNull(),
  instructorId: uuid("instructor_id").references(() => users.id, { onDelete: 'cascade' }),
  status: text("status").default("Aktif").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
