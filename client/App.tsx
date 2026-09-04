import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Mahasiswa pages
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import MahasiswaSesiDetail from "./pages/MahasiswaSesiDetail";
import MahasiswaDiskusi from "./pages/MahasiswaDiskusi";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminDosen from "./pages/admin/AdminDosen";
import AdminMahasiswa from "./pages/admin/AdminMahasiswa";
import AdminMatakuliah from "./pages/admin/AdminMatakuliah";
import AdminProdi from "./pages/admin/AdminProdi";
import AdminKelas from "./pages/admin/AdminKelas";

// Dosen pages
import DosenDashboard from "./pages/dosen/DosenDashboard";
import DosenJadwal from "./pages/dosen/DosenJadwal";
import DosenMateri from "./pages/dosen/DosenMateri";
import DosenDiskusi from "./pages/dosen/DosenDiskusi";
import DosenMahasiswa from "./pages/dosen/DosenMahasiswa";
import DosenLaporan from "./pages/dosen/DosenLaporan";
import DosenPengaturan from "./pages/dosen/DosenPengaturan";
import DosenProfile from "./pages/dosen/DosenProfile";
import DosenSesiDetail from "./pages/dosen/DosenSesiDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProfile /></ProtectedRoute>} />
            <Route path="/admin/dosen" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDosen /></ProtectedRoute>} />
            <Route path="/admin/mahasiswa" element={<ProtectedRoute allowedRoles={["admin"]}><AdminMahasiswa /></ProtectedRoute>} />
            <Route path="/admin/matakuliah" element={<ProtectedRoute allowedRoles={["admin"]}><AdminMatakuliah /></ProtectedRoute>} />
            <Route path="/admin/prodi" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProdi /></ProtectedRoute>} />
            <Route path="/admin/kelas" element={<ProtectedRoute allowedRoles={["admin"]}><AdminKelas /></ProtectedRoute>} />

            {/* Dosen */}
            <Route path="/dosen/dashboard" element={<ProtectedRoute allowedRoles={["dosen"]}><DosenDashboard /></ProtectedRoute>} />
            <Route path="/dosen/jadwal" element={<ProtectedRoute allowedRoles={["dosen"]}><DosenJadwal /></ProtectedRoute>} />
            <Route path="/dosen/materi" element={<ProtectedRoute allowedRoles={["dosen"]}><DosenMateri /></ProtectedRoute>} />
            <Route path="/dosen/diskusi" element={<ProtectedRoute allowedRoles={["dosen"]}><DosenDiskusi /></ProtectedRoute>} />
            <Route path="/dosen/mahasiswa" element={<ProtectedRoute allowedRoles={["dosen"]}><DosenMahasiswa /></ProtectedRoute>} />
            <Route path="/dosen/laporan" element={<ProtectedRoute allowedRoles={["dosen"]}><DosenLaporan /></ProtectedRoute>} />
            <Route path="/dosen/pengaturan" element={<ProtectedRoute allowedRoles={["dosen"]}><DosenPengaturan /></ProtectedRoute>} />
            <Route path="/dosen/profile" element={<ProtectedRoute allowedRoles={["dosen"]}><DosenProfile /></ProtectedRoute>} />
            <Route path="/dosen/sesi/:id" element={<ProtectedRoute allowedRoles={["dosen"]}><DosenSesiDetail /></ProtectedRoute>} />

            {/* Mahasiswa */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["mahasiswa"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/diskusi" element={<ProtectedRoute allowedRoles={["mahasiswa"]}><MahasiswaDiskusi /></ProtectedRoute>} />
            <Route path="/course/:courseId" element={<ProtectedRoute allowedRoles={["mahasiswa"]}><CourseDetail /></ProtectedRoute>} />
            <Route path="/sesi/:id" element={<ProtectedRoute allowedRoles={["mahasiswa"]}><MahasiswaSesiDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["mahasiswa"]}><Profile /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
