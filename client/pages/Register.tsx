import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const [formData, setFormData] = useState({
    nim: "",
    program: "",
    fullName: "",
    gender: "male" as const,
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

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validation
      if (!formData.nim || !formData.fullName || !formData.email || !formData.password) {
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
          Buat <span className="text-purple-600">Akun Baru</span>
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Isi data diri kamu untuk membuat akun di Smart Lecture
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NIM and Program */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nim" className="block text-sm font-medium text-gray-700 mb-2">
                NIM
              </label>
              <input
                type="text"
                id="nim"
                name="nim"
                value={formData.nim}
                onChange={handleChange}
                placeholder="Masukkan NIM"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                Program Studi
              </label>
              <select
                id="program"
                name="program"
                value={formData.program}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Pilih program</option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
                <option value="Keamanan Informasi">Keamanan Informasi</option>
              </select>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <div className="relative">
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                👤
              </span>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email kamu"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Buat Password"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Konfirmasi Password"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 w-5 h-5 accent-purple-600 rounded cursor-pointer disabled:cursor-not-allowed"
            />
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
              Saya setuju dengan <span className="font-medium">Syarat & Ketentuan</span> dan{" "}
              <span className="font-medium">Kebijakan Privasi</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-sm mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </button>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
              Masuk
            </a>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
