import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleRegister, handleLogout } from "./routes/auth";
import {
  handleGetDashboard,
  handleGetCourses,
  handleGetCourseById,
  handleGetCourseTranscripts,
} from "./routes/courses";
import { handleGetProfile, handleUpdateProfile } from "./routes/user";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  // Course routes
  app.get("/api/dashboard", handleGetDashboard);
  app.get("/api/courses", handleGetCourses);
  app.get("/api/courses/:courseId", handleGetCourseById);
  app.get("/api/courses/:courseId/transcripts", handleGetCourseTranscripts);

  // User routes
  app.get("/api/user/profile", handleGetProfile);
  app.put("/api/user/profile", handleUpdateProfile);

  return app;
}
