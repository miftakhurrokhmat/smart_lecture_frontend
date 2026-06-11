/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  message?: string;
}

export interface RegisterRequest {
  nim: string;
  program: string;
  fullName: string;
  gender: "male" | "female";
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  nim: string;
  program: string;
  gender: "male" | "female";
}

export interface UserProfileResponse {
  success: boolean;
  user?: User;
  message?: string;
}

// Course Types
export interface Course {
  id: string;
  name: string;
  instructor: string;
  icon: string;
  color: string;
  status: "LIVE" | "Selesaiakses" | "Sedang diakses";
  time: string;
  code?: string;
}

export interface DashboardResponse {
  success: boolean;
  courses: Course[];
  user: {
    name: string;
    email: string;
  };
}

// Course Detail Types
export interface Transcript {
  id: string;
  time: string;
  text: string;
  status: "Ready" | "Processing";
}

export interface CourseDetail {
  id: string;
  name: string;
  instructor: string;
  time: string;
  status: string;
  transcripts: Transcript[];
  summary?: string;
}

export interface CourseDetailResponse {
  success: boolean;
  course?: CourseDetail;
  message?: string;
}
