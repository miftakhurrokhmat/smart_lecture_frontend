import { RequestHandler } from "express";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@shared/api";

// Mock user database
const mockUsers: Record<string, any> = {
  "minato@smartlecture.com": {
    id: "1",
    email: "minato@smartlecture.com",
    password: "password123",
    name: "Minato",
    nim: "12345678",
    program: "Teknik Informatika",
    gender: "male",
  },
};

// Mock sessions
const sessions: Record<string, any> = {};

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
    expiresAt: Date.now() + 86400000, // 24 hours
  };

  const response: LoginResponse = {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
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

  // Create new user
  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    password,
    name: fullName,
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
    expiresAt: Date.now() + 86400000,
  };

  const response: RegisterResponse = {
    success: true,
    message: "Registration successful",
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
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
