import { RequestHandler } from "express";
import { DashboardResponse, CourseDetailResponse, Course, CourseDetail, Transcript } from "@shared/api";

// Mock courses database
const mockCourses: Record<string, Course> = {
  "1": {
    id: "1",
    name: "Sistem Informasi (TI-3A)",
    instructor: "Miftakhurrokhmat",
    icon: "📋",
    color: "from-blue-400 to-blue-600",
    status: "LIVE",
    time: "08:00-10:00",
    code: "TI301",
  },
  "2": {
    id: "2",
    name: "Basis Data (TI-3A)",
    instructor: "Miftakhurrokhmat",
    icon: "💾",
    color: "from-green-400 to-green-600",
    status: "Selesaiakses",
    time: "10:20-12:00",
    code: "TI302",
  },
  "3": {
    id: "3",
    name: "Kecerdasan Buatan (TI-3A)",
    instructor: "Miftakhurrokhmat",
    icon: "🤖",
    color: "from-purple-400 to-purple-600",
    status: "Sedang diakses",
    time: "12:20-14:00",
    code: "TI303",
  },
};

// Mock transcripts database
const mockTranscripts: Record<string, Transcript[]> = {
  "1": [
    {
      id: "t1",
      time: "10:15:32",
      text: "Selamat pagi semuanya. Pada pertemuan kali ini kita akan membahas tentang teknik-teknik database beserta schema normalization di dalamnya juga akan membahaskan konsep lainnya untuk memahami tentang database dan schema design.",
      status: "Ready",
    },
    {
      id: "t2",
      time: "10:32:12",
      text: "Selamat pagi semuanya. Pada pertemuan kali ini kita akan membahas tentang teknik-teknik database beserta schema normalization di dalamnya juga akan membahaskan konsep lainnya untuk memahami tentang database dan schema design.",
      status: "Ready",
    },
    {
      id: "t3",
      time: "10:35:31",
      text: "Selamat pagi semuanya. Pada pertemuan kali ini kita akan membahas tentang teknik-teknik database beserta schema normalization di dalamnya juga akan membahaskan konsep lainnya untuk memahami tentang database dan schema design.",
      status: "Ready",
    },
  ],
};

// Mock course details database
const mockCourseDetails: Record<string, CourseDetail> = {
  "1": {
    id: "1",
    name: "Sistem Informasi (TI-3A)",
    instructor: "Miftakhurrokhmat",
    time: "08:00 - 10:00",
    status: "LIVE",
    transcripts: mockTranscripts["1"] || [],
    summary: `
      Pembahasan tentang teknik-teknik database dan schema normalization.
      Konsep penting dalam database design dan implementation.
      Best practices untuk mengoptimalkan performa database.
    `,
  },
};

export const handleGetDashboard: RequestHandler = (req, res) => {
  const response: DashboardResponse = {
    success: true,
    courses: Object.values(mockCourses),
    user: {
      name: "Minato",
      email: "minato@smartlecture.com",
    },
  };

  res.status(200).json(response);
};

export const handleGetCourses: RequestHandler = (req, res) => {
  const courses = Object.values(mockCourses);

  res.status(200).json({
    success: true,
    courses,
  });
};

export const handleGetCourseById: RequestHandler = (req, res) => {
  const { courseId } = req.params;

  const course = mockCourses[courseId];
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  const courseDetail = mockCourseDetails[courseId] || {
    id: course.id,
    name: course.name,
    instructor: course.instructor,
    time: course.time,
    status: course.status,
    transcripts: mockTranscripts[courseId] || [],
    summary: `Dummy summary for ${course.name}`,
  };

  const response: CourseDetailResponse = {
    success: true,
    course: courseDetail,
  };

  res.status(200).json(response);
};

export const handleGetCourseTranscripts: RequestHandler = (req, res) => {
  const { courseId } = req.params;

  const transcripts = mockTranscripts[courseId] || [];

  res.status(200).json({
    success: true,
    transcripts,
  });
};
