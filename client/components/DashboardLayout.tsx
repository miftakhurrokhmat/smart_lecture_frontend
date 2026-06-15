import React, { useState } from "react";
import { Bell, HelpCircle, Home, User, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { icon: Home, label: "Beranda", href: "/dashboard" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  const isActive = (href: string) => location.pathname === href;

  const currentNav = navItems.find((item) => isActive(item.href));
  const breadcrumbLabel = currentNav?.label ?? "Beranda";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — always visible, fixed width */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src="/assets/Logo.png"
              alt="Smart Lecture Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-gray-900 text-base whitespace-nowrap">
              Smart <span className="text-purple-600">Lecture</span>
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? "text-purple-600" : "text-gray-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        {user && (
          <div className="px-3 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Halo, {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">Mahasiswa</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="text-gray-400">Smart Lecture</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">{breadcrumbLabel}</span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 mr-3">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4 text-gray-500" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Bantuan"
            >
              <HelpCircle className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
};
