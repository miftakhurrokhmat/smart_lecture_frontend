import { RequestHandler } from "express";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@shared/api";

type UserRole = "admin" | "dosen" | "mahasiswa";

interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;

  // Mahasiswa
  nim?: string;
  program?: string;
  gender?: string;

  // Dosen
  nidn?: string;
  faculty?: string;
}

// Mock user database
const mockUsers: Record<string, MockUser> = {
  // Mahasiswa
  "minato@smartlecture.com": {
    id: "1",
    email: "minato@smartlecture.com",
    password: "password123",
    name: "Minato",
    role: "mahasiswa",
    nim: "12345678",
    program: "Teknik Informatika",
    gender: "male",
  },

  // Admin
  "admin@smartlecture.com": {
    id: "2",
    email: "admin@smartlecture.com",
    password: "admin123",
    name: "Administrator",
    role: "admin",
  },

  // Dosen
  "dosen@smartlecture.com": {
    id: "3",
    email: "dosen@smartlecture.com",
    password: "dosen123",
    name: "Miftakhurrokhmat",
    role: "dosen",
    nidn: "0011223344",
    faculty: "Fakultas Teknik",
  },
};

// Mock sessions
const sessions: Record<
  string,
  {
    userId: string;
    email: string;
    role: UserRole;
    expiresAt: number;
  }
> = {};

export const handleLogin: RequestHandler = (req, res) => {
  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = mockUsers[email];

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Create mock token
  const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");

  sessions[token] = {
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + 86400000,
  };

  const response: LoginResponse = {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };

  res.status(200).json(response);
};

export const handleRegister: RequestHandler = (req, res) => {
  const { nim, program, fullName, gender, email, password, confirmPassword } =
    req.body as RegisterRequest;

  if (!nim || !program || !fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  if (mockUsers[email]) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  const newUser: MockUser = {
    id: Math.random().toString(36).substring(2, 11),
    email,
    password,
    name: fullName,
    role: "mahasiswa",
    nim,
    program,
    gender,
  };

  mockUsers[email] = newUser;

  // Create mock token
  const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");

  sessions[token] = {
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    expiresAt: Date.now() + 86400000,
  };

  const response: RegisterResponse = {
    success: true,
    message: "Registration successful",
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
  };

  res.status(201).json(response);
};

export const handleLogout: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token && sessions[token]) {
    delete sessions[token];
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
