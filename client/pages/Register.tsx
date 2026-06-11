import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    nim: "",
    program: "",
    fullName: "",
    gender: "male",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.nim &&
      formData.fullName &&
      formData.email &&
      formData.password === formData.confirmPassword &&
      formData.agreeTerms
    ) {
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
          Buat <span className="text-purple-600">Akun Baru</span>
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Isi data diri kamu untuk membuat akun di Smart Lecture
        </p>

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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900"
              >
                <option value="">Pilih program</option>
                <option value="ti">Teknik Informatika</option>
                <option value="si">Sistem Informasi</option>
                <option value="km">Keamanan Informasi</option>
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
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
                  className="w-4 h-4 accent-purple-600"
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
                  className="w-4 h-4 accent-purple-600"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Buat Password"
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className="mt-1 w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
              Saya setuju dengan <span className="font-medium">Syarat & Ketentuan</span> dan{" "}
              <span className="font-medium">Kebijakan Privasi</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-sm mt-6"
          >
            Daftar Sekarang
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
