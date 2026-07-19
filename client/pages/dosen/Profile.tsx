import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Mail, User, BookOpen, Hash, Pencil } from "lucide-react";

export default function Profile() {
  const user = {
    name: "Miftakhurohman",
    email: "dosen@smartlecture.com",
    nidn: "12345678",
    prodi: "Teknik Informatika",
  };

  return (
    // <DashboardLayout currentUser={{ name: user.name, email: user.email }}>
    <DashboardLayout>
      <div
        className="min-h-full w-full"
        style={{
          backgroundImage: "url('/assets/bg-cover.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "local",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-10">
          {/* <h1 className="text-3xl font-bold text-[#643DDD] drop-shadow-sm mb-8">
            Profile
          </h1> */}

          {/* Header card */}
          <div className="relative rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-xl overflow-hidden mb-6">
            {/* Cover accent */}
            <div className="h-24 w-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600" />

            <div className="px-8 pb-8 -mt-12 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="w-24 h-24 shrink-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="pb-7">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="flex items-center gap-1.5 text-gray-900 text-sm mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Details card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Informasi Akun
            </h3>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 text-purple-500" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={user.name}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none"
                  disabled
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 text-purple-500" />
                    NIDN
                  </label>
                  <input
                    type="text"
                    value={user.nidn}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none"
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    Program Studi
                  </label>
                  <input
                    type="text"
                    value={user.prodi}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none"
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 text-purple-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none"
                  disabled
                  readOnly
                />
              </div>
            </div>

            <button className="mt-8 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg">
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
