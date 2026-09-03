import "./global.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import DosenDashboard from "./pages/dosen/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import DosenProfile from "./pages/dosen/Profile";
import DosenJadwal from "./pages/dosen/Jadwal";
import NotFound from "./pages/NotFound";
import Dosen from "./pages/admin/Dosen";
import MataKuliah from "./pages/admin/Makul";
import Mahasiswa from "./pages/admin/Mahasiswa";
import AdminProfile from "./pages/admin/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {" "}
          {/* ← wrap Routes dengan ini */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Mahasiswa */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dosen" element={<Dosen />} />
            <Route path="/admin/matakuliah" element={<MataKuliah />} />
            <Route path="/admin/mahasiswa" element={<Mahasiswa />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            {/* Dosen */}
            <Route path="/dosen/dashboard" element={<DosenDashboard />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/dosen/profile" element={<DosenProfile />} />
            <Route path="/dosen/jadwal" element={<DosenJadwal />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
