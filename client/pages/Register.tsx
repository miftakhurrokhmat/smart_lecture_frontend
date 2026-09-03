import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
  Mail,
  Lock,
  User,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  type Gender = "male" | "female";

  const [formData, setFormData] = useState({
    nim: "",
    program: "",
    fullName: "",
    gender: "male" as Gender,
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (
        !formData.nim ||
        !formData.fullName ||
        !formData.email ||
        !formData.password
      ) {
        setError("All fields are required");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!formData.agreeTerms) {
        setError("You must agree to terms and conditions");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
      <div
        className="w-full max-w-[1280px] bg-white rounded-2xl overflow-hidden shadow-md flex flex-col lg:flex-row"
        style={{ minHeight: "auto" }}
      >
        {/* LEFT PANEL - Illustration */}
        <div className="hidden lg:block lg:w-[55.5%] relative flex-shrink-0 self-stretch">
          <img
            src="/assets/img-bg.png"
            alt="Smart Lecture Illustration"
            className="absolute inset-0 w-full h-full object-cover"
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

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-14 xl:px-20">
            <div className="w-full max-w-[400px]">
              {/* Title */}
              <h2 className="text-2xl text-center lg:text-3xl xl:text-[32px] font-bold text-gray-900 mb-6">
                Buat <span className="text-purple-600">Akun Baru</span>
              </h2>
              <p className="text-center text-[14px] font-bold leading-[20px] tracking-[0.05em] text-gray-500 mb-8">
                Isi data diri kamu untuk membuat akun di Smart Lecture
              </p>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* NIM & Program Studi */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="nim"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      NIM
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        id="nim"
                        name="nim"
                        value={formData.nim}
                        onChange={handleChange}
                        placeholder="Masukkan NIM"
                        disabled={isLoading}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="program"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Program Studi
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        id="program"
                        name="program"
                        value={formData.program}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none ${
                          formData.program ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        <option value="">Pilih program</option>
                        <option value="Teknik Informatika">
                          Teknik Informatika
                        </option>
                        <option value="Sistem Informasi">
                          Sistem Informasi
                        </option>
                        <option value="Keamanan Informasi">
                          Keamanan Informasi
                        </option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-gray-800 mb-2"
                  >
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Gender
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-4 h-4 accent-purple-600 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700">Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-4 h-4 accent-purple-600 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700">Perempuan</span>
                    </label>
                  </div>
                </div>

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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
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
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Buat Password"
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
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-800 mb-2"
                  >
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Konfirmasi Password"
                      disabled={isLoading}
                      className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mt-0.5 w-4 h-4 accent-purple-600 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor="agreeTerms"
                    className="text-[12px] whitespace-nowrap text-gray-600 cursor-pointer"
                  >
                    Saya setuju dengan{" "}
                    <a
                      href="#"
                      className="font-semibold text-purple-600 hover:text-purple-700"
                    >
                      Syarat & Ketentuan
                    </a>{" "}
                    dan{" "}
                    <a
                      href="#"
                      className="font-semibold text-purple-600 hover:text-purple-700"
                    >
                      Kebijakan Privasi
                    </a>
                  </label>
                </div>

                {/* Submit */}
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
                    "Daftar Sekarang"
                  )}
                </button>

                {/* Sign in link */}
                <p className="text-center text-sm text-gray-600">
                  Sudah punya akun?{" "}
                  <a
                    href="/login"
                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                  >
                    Masuk
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
