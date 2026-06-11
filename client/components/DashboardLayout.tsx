import React, { useState } from "react";
import { Menu, X, User, Bell, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    {
      icon: "📚",
      label: "Beranda",
      href: "/dashboard",
    },
    {
      icon: "👤",
      label: "Profile",
      href: "/profile",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">▶</span>
            </div>
            <span className="font-bold text-gray-900">
              Smart <span className="text-purple-600">Lecture</span>
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 hidden md:block"></div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Notifications">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};
