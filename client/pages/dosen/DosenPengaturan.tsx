import { DashboardLayout } from "@/components/DashboardLayout";
import { Settings, Bell, Mic, Lock, Globe, Sparkles } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";

export default function DosenPengaturan() {
  return (
    <DashboardLayout>
      <div className="w-full px-4 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600" />
            Pengaturan Akun & Sistem
          </h1>
          <p className="text-gray-500 text-sm mt-1">Konfigurasi preferensi aplikasi dan keamanan akun Anda.</p>
        </div>

        <div className="flex flex-col gap-8">
          
          {/* Sistem & Notifikasi */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Preferensi Sistem</h2>
            
            <div className="space-y-6">
              {/* Notifikasi */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <Bell className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Notifikasi Email</h4>
                    <p className="text-xs text-gray-500 mt-1">Kirim ringkasan sesi ke email mahasiswa setelah kelas selesai.</p>
                  </div>
                </div>
                <Switch.Root defaultChecked className="w-[42px] h-[25px] bg-gray-200 rounded-full relative shadow-[0_2px_10px] shadow-blackA4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-purple-600 outline-none cursor-default">
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA7 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                </Switch.Root>
              </div>

              {/* Auto AI */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Auto-Generate Ringkasan AI</h4>
                    <p className="text-xs text-gray-500 mt-1">Otomatis buat ringkasan, poin penting, dan mindmap saat sesi berakhir.</p>
                  </div>
                </div>
                <Switch.Root defaultChecked className="w-[42px] h-[25px] bg-gray-200 rounded-full relative shadow-[0_2px_10px] shadow-blackA4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-purple-600 outline-none cursor-default">
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA7 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                </Switch.Root>
              </div>

              {/* Bahasa Default */}
              <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 pt-2 border-t border-gray-50">
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Bahasa Transkrip Default</h4>
                    <p className="text-xs text-gray-500 mt-1">Pilih bahasa utama yang digunakan saat mengajar.</p>
                  </div>
                </div>
                <select className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-medium">
                  <option value="id-ID">Indonesia (id-ID)</option>
                  <option value="en-US">English (en-US)</option>
                </select>
              </div>

              {/* TTS Voice */}
              <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 pt-2 border-t border-gray-50">
                <div className="flex gap-3">
                  <Mic className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Suara Pembacaan (TTS)</h4>
                    <p className="text-xs text-gray-500 mt-1">Suara default untuk fitur Text-to-Speech pada transkrip.</p>
                  </div>
                </div>
                <select className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-medium">
                  <option value="alloy">Alloy (Netral)</option>
                  <option value="echo">Echo (Pria)</option>
                  <option value="nova">Nova (Wanita)</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                Simpan Preferensi
              </button>
            </div>
          </section>

          {/* Keamanan */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              Keamanan Akun
            </h2>
            
            <form className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input type="password" placeholder="Minimal 8 karakter" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input type="password" placeholder="Ketik ulang password baru" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
              <div className="pt-2">
                <button type="button" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm w-full sm:w-auto">
                  Perbarui Password
                </button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}
