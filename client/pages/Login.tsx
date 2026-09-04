import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Globe, ChevronDown, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // biarkan handleSubmit yang menentukan redirect
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Email and password are required");
        return;
      }
      const user = await login(email, password);

      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;

        case "dosen":
          navigate("/dosen/dashboard");
          break;

        case "mahasiswa":
        default:
          navigate("/dashboard");
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
      {/* Card — 1280x912 on 1440 canvas, scales down responsively */}
      <div
        className="w-full max-w-[1280px] bg-white rounded-2xl overflow-hidden shadow-md flex flex-col lg:flex-row"
        style={{
          minHeight: "auto",
        }}
      >
        {/* LEFT PANEL - Illustration */}
        <div className="hidden lg:block lg:w-[55.5%] relative flex-shrink-0">
          <img
            src="/assets/img-bg.png"
            alt="Smart Lecture Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT PANEL - Form */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Language selector */}
          <div className="flex justify-end px-6 pt-6 lg:px-10 lg:pt-8">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <Globe className="h-4 w-4 shrink-0 relative top-[1px]" />
              <span>Bahasa Indonesia</span>
              <ChevronDown className="h-4 w-4 shrink-0 relative top-[1px]" />
            </button>
          </div>

          {/* Form area - centered */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:px-14 xl:px-20">
            <div className="w-full max-w-[400px]">
              {/* Title */}
              <h2 className="text-2xl text-center lg:text-3xl xl:text-[32px] font-bold text-gray-900 mb-6 whitespace-normal sm:whitespace-nowrap">
                Masuk ke <span className="text-purple-600">Smart Lecture</span>
              </h2>
              <p className="text-center text-[14px] font-bold leading-[20px] tracking-[0.05em] text-gray-500 mb-8">
                Selamat datang kembali, silahkan masuk untuk melanjutkan belajar
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-800 mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email kamu"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-800 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password kamu"
                      disabled={isLoading}
                      className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
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
                  <a
                    href="#"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    Lupa password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold py-3.5 rounded-xl transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "Masuk"
                  )}
                </button>

                {/* Sign up link */}
                <p className="text-center text-sm text-gray-600">
                  Belum punya akun?{" "}
                  <a
                    href="/register"
                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                  >
                    Daftar disini
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs font-bold text-gray-500 mt-4">
        © 2026 Smart Lecture. All rights reserved.
      </p>
    </div>
  );
}
