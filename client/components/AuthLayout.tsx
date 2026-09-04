import React from "react";
import { Mic, GraduationCap, Play } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-lavender-50 to-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center p-6 md:p-12 min-h-screen">
        {/* Left side - Hero */}
        <div className="hidden md:flex flex-col justify-center items-center md:items-start space-y-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Smart <span className="text-purple-600">Lecture</span>
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Belajar <span className="text-purple-600">inklusif,</span> setiap suara
              <br />
              berarti.
            </h1>
            <p className="text-gray-600 text-lg">
              Smart Lecture membawa kamu belajar lebih baik dengan transkripsi real-time, inggasan AI, dan diskusi bersama dosen.
            </p>
          </div>

          <div className="space-y-4 w-full">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Transkripsi Real-time</p>
                <p className="text-sm text-gray-500">Live</p>
              </div>
            </div>
          </div>

          {/* Illustration area - simplified */}
          <div className="w-full mt-12 flex justify-center md:justify-start">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-lavender-300 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="w-20 h-20 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex justify-center items-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
};
