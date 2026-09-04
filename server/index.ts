import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleRegister, handleLogout } from "./routes/auth";
import {
  handleGetDashboard,
  handleGetCourses,
  handleGetCourseById,
  handleGetCourseTranscripts,
  handleGetMahasiswaSessionDetail
} from "./routes/courses";
import { handleGetProfile, handleUpdateProfile } from "./routes/user";
import * as adminRoutes from "./routes/admin";
import { handleGetUsers, handleCreateUser, handleDeleteUser, handleGetAdminCourses, handleCreateCourse } from "./routes/admin";
import { 
  handleGetSessions, 
  handleCreateSession, 
  handleUpdateSession, 
  handleDeleteSession, 
  handleGetDosenClasses, 
  handleGetDosenStudents,
  handleGetMaterials, 
  handleUploadMaterial, 
  handleGetDosenCourses, 
  handleGetSessionStudents, 
  handleGetSessionDiscussions, 
  handlePostDiscussion, 
  handleGetSessionMaterials, 
  handleGetSessionDetailDosen,
  handleSaveTranscript,
  handleGetTranscripts,
  handleEndSession,
  handleGetDosenReports,
  upload 
} from "./routes/dosen";
import {
  handleGetDiscussionOptions,
  handleGetDiscussions,
  handleCreateDiscussion,
  handleReplyDiscussion,
} from "./routes/discussions";
import {
  handleGetReminders,
  handleCreateReminder,
  handleUpdateReminder,
  handleDeleteReminder,
} from "./routes/reminders";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/logout", handleLogout);

  // Admin routes
  app.get("/api/admin/users", handleGetUsers);
  app.post("/api/admin/users", handleCreateUser);
  app.delete("/api/admin/users/:id", handleDeleteUser);
  app.get("/api/admin/courses", handleGetAdminCourses);
  app.post("/api/admin/courses", handleCreateCourse);
  app.get("/api/admin/prodi", adminRoutes.handleGetStudyPrograms);
  app.post("/api/admin/prodi", adminRoutes.handleCreateStudyProgram);
  app.patch("/api/admin/prodi/:id", adminRoutes.handleUpdateStudyProgram);
  app.delete("/api/admin/prodi/:id", adminRoutes.handleDeleteStudyProgram);
  app.get("/api/admin/classes", adminRoutes.handleGetClasses);
  app.post("/api/admin/classes", adminRoutes.handleCreateClass);
  app.delete("/api/admin/classes/:id", adminRoutes.handleDeleteClass);
  app.get("/api/admin/classes/:id/students", adminRoutes.handleGetClassStudents);
  app.post("/api/admin/classes/:id/students", adminRoutes.handleAddClassStudent);
  app.delete("/api/admin/classes/:id/students/:studentId", adminRoutes.handleRemoveClassStudent);

  // Dosen routes (Sessions & Materials)
  app.get("/api/dosen/courses", handleGetDosenCourses);
  app.get("/api/dosen/sessions", handleGetSessions);
  app.post("/api/dosen/sessions", handleCreateSession);
  app.patch("/api/dosen/sessions/:id", handleUpdateSession);
  app.delete("/api/dosen/sessions/:id", handleDeleteSession);
  app.get("/api/dosen/classes", handleGetDosenClasses);
  app.get("/api/dosen/students", handleGetDosenStudents);
  app.get("/api/dosen/reports", handleGetDosenReports);
  app.get("/api/dosen/materials", handleGetMaterials);
  app.post("/api/dosen/materials", upload.single("file"), handleUploadMaterial);
  
  app.get("/api/dosen/sessions/:id", handleGetSessionDetailDosen);
  app.post("/api/dosen/sessions/:id/end", handleEndSession);
  app.get("/api/dosen/sessions/:id/transcripts", handleGetTranscripts);
  app.post("/api/dosen/sessions/:id/transcripts", handleSaveTranscript);

  app.get("/api/dosen/sessions/:id/students", handleGetSessionStudents);
  app.get("/api/dosen/sessions/:id/discussions", handleGetSessionDiscussions);
  app.post("/api/dosen/sessions/:id/discussions", handlePostDiscussion);
  app.get("/api/dosen/sessions/:id/materials", handleGetSessionMaterials);

  // Discussion forum routes
  app.get("/api/discussions/options", handleGetDiscussionOptions);
  app.get("/api/discussions", handleGetDiscussions);
  app.post("/api/discussions", handleCreateDiscussion);
  app.post("/api/discussions/:id/reply", handleReplyDiscussion);

  // Reminders routes
  app.get("/api/reminders", handleGetReminders);
  app.post("/api/reminders", handleCreateReminder);
  app.put("/api/reminders/:id", handleUpdateReminder);
  app.delete("/api/reminders/:id", handleDeleteReminder);

  // TTS Route (Proxy to apiai FastAPI port 8000)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ success: false, message: "Teks tidak boleh kosong" });
      }

      const ttsResponse = await fetch("http://localhost:8000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voice: voice || "id-ID-GadisNeural",
        }),
      });

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        return res.status(ttsResponse.status).json({ success: false, message: errorText });
      }

      res.setHeader("Content-Type", "audio/mpeg");
      const buffer = await ttsResponse.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error proxying TTS request:", error);
      res.status(500).json({ success: false, message: "Gagal menghubungkan ke engine TTS apiai" });
    }
  });

  // Course routes
  app.get("/api/dashboard", handleGetDashboard);
  app.get("/api/courses", handleGetCourses);
  app.get("/api/courses/:courseId", handleGetCourseById);
  app.get("/api/courses/:courseId/transcripts", handleGetCourseTranscripts);
  app.get("/api/mahasiswa/sessions/:id", handleGetMahasiswaSessionDetail);

  // User routes
  app.get("/api/user/profile", handleGetProfile);
  app.put("/api/user/profile", handleUpdateProfile);

  return app;
}
