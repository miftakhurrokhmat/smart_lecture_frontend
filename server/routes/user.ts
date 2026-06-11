import { RequestHandler } from "express";
import { UserProfileResponse, User } from "@shared/api";

// Mock user database
const mockUsers: Record<string, User> = {
  "1": {
    id: "1",
    email: "minato@smartlecture.com",
    name: "Minato",
    nim: "12345678",
    program: "Teknik Informatika",
    gender: "male",
  },
};

export const handleGetProfile: RequestHandler = (req, res) => {
  // In a real app, get user ID from token/session
  const userId = req.query.userId as string || "1";

  const user = mockUsers[userId];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const response: UserProfileResponse = {
    success: true,
    user,
  };

  res.status(200).json(response);
};

export const handleUpdateProfile: RequestHandler = (req, res) => {
  const userId = req.query.userId as string || "1";
  const { name, email, nim, program, gender } = req.body;

  const user = mockUsers[userId];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (nim) user.nim = nim;
  if (program) user.program = program;
  if (gender) user.gender = gender;

  const response: UserProfileResponse = {
    success: true,
    user,
  };

  res.status(200).json(response);
};
