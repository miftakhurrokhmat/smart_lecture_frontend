import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Profile() {
  return (
    <DashboardLayout currentUser={{ name: "Minato", email: "minato@smartlecture.com" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              M
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Minato</h2>
              <p className="text-gray-600">minato@smartlecture.com</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value="Minato"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIM
                </label>
                <input
                  type="text"
                  value="12345678"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Studi
                </label>
                <input
                  type="text"
                  value="Teknik Informatika"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value="minato@smartlecture.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                disabled
              />
            </div>
          </div>

          <button className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
