import { RequestHandler } from "express";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@shared/api";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Sesi memori sederhana (Bisa diganti JWT nanti)
const sessions: Record<string, { userId: string; email: string; role: string; expiresAt: number }> = {};

import { seedDatabase } from "../seed";

// Jalankan inisialisasi seed database secara asinkron
seedDatabase();

export const handleLogin: RequestHandler = async (req, res) => {
  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
    sessions[token] = { userId: user.id, email: user.email, role: user.role, expiresAt: Date.now() + 86400000 };

    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role as any },
    } as LoginResponse);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleRegister: RequestHandler = async (req, res) => {
  const { nim, program, fullName, gender, email, password, confirmPassword } = req.body as RegisterRequest;

  if (!nim || !program || !fullName || !email || !password) {
    return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Password tidak cocok" });
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: "Email sudah terdaftar" });
    }

    const newUser = await db.insert(users).values({
      email,
      password, // Todo: Enkripsi bcrypt untuk production
      name: fullName,
      role: "mahasiswa",
      identifier: nim,
      prodi: program,
      gender,
    }).returning();

    const user = newUser[0];
    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
    sessions[token] = { userId: user.id, email: user.email, role: user.role, expiresAt: Date.now() + 86400000 };

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      user: { id: user.id, email: user.email, name: user.name, role: user.role as any },
    } as RegisterResponse);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const handleLogout: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token && sessions[token]) {
    delete sessions[token];
  }
  res.status(200).json({ success: true, message: "Logged out successfully" });
};
