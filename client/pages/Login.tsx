import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (email && password) {
      // Navigate to dashboard
      navigate("/dashboard");
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        {/* Language selector */}
        <div className="flex justify-end mb-6">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            🌐 <span>Bahasa Indonesia</span> <span className="text-xs">▼</span>
          </button>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Masuk ke <span className="text-purple-600">Smart Lecture</span>
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Selamat datang kembali, silahkan masuk untuk melanjutkan pembelajaran
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email kamu"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                ✉️
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password kamu"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Lupa password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-sm"
          >
            Masuk
          </button>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <a href="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
              Daftar dini
            </a>
          </p>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          © 2024 Smart Lecture. All rights reserved.
        </p>
      </div>
    </AuthLayout>
  );
}
