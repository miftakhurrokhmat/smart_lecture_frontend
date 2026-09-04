import re

with open("client/pages/MahasiswaSesiDetail.tsx", "r") as f:
    content = f.read()

# We need to replace the content of PANEL KANAN.
panel_kanan_start = content.find("{/* PANEL KANAN */}")
panel_kanan_end = content.find("{/* Static Bottom Toolbar */}")

before = content[:panel_kanan_start]
after = content[panel_kanan_end:]

kanan_content = content[panel_kanan_start:panel_kanan_end]

# Extract Materi Block
materi_start = kanan_content.find("{/* Top Right: Materi PDF Viewer */}")
materi_end = kanan_content.find("{/* Bottom Right: Ringkasan AI & Diskusi */}")
materi_block = kanan_content[materi_start:materi_end].strip()

# Clean up Materi Block outer div
# We change its outer div to be col-span-12 lg:col-span-7
materi_block = materi_block.replace(
    '<div className="flex-none lg:flex-[4] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[500px] lg:h-auto min-h-0">',
    '<div className="col-span-12 lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[500px] lg:h-auto min-h-0">'
)

# Replace "flex-1 flex overflow-hidden bg-gray-50..." with added min-h-0
materi_block = materi_block.replace(
    '<div className="flex-1 flex overflow-hidden bg-gray-50 p-2 sm:p-4 gap-2 sm:gap-4 relative">',
    '<div className="flex-1 flex overflow-hidden bg-gray-50 p-2 sm:p-4 gap-2 sm:gap-4 relative min-h-0">'
)

# Remove the title "{/* Top Right: Materi PDF Viewer */}"
materi_block = materi_block.replace("{/* Top Right: Materi PDF Viewer */}", "{/* Far Right: Materi PDF Viewer */}")


# Extract Ringkasan Block
ringkasan_start = kanan_content.find("{/* Ringkasan AI */}")
ringkasan_end = kanan_content.find("{/* Diskusi Dosen */}")
ringkasan_block = kanan_content[ringkasan_start:ringkasan_end].strip()

# Change ringkasan block outer div to be flex-1
ringkasan_block = ringkasan_block.replace(
    '<div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full min-h-0">',
    '<div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-0">'
)


# Extract Diskusi Block
diskusi_start = kanan_content.find("{/* Diskusi Dosen */}")
diskusi_end = kanan_content.rfind("</div>\n        </div>\n      </div>") # approximate end of panel kanan
diskusi_block = kanan_content[diskusi_start:diskusi_end].strip()

# Fix diskusi outer div
diskusi_block = diskusi_block.replace(
    '<div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full min-h-0">',
    '<div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-0">'
)
# Add min-h-0 to inner chat list
diskusi_block = diskusi_block.replace(
    '<div className="flex-1 overflow-y-auto  p-4 space-y-4 bg-gray-50/30 min-h-[150px]">',
    '<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 min-h-0">'
)


# Construct New Panel Kanan
new_kanan = """{/* PANEL KANAN */}
        <div className="col-span-12 lg:col-span-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 min-h-0">
          
          {/* Middle Column: Diskusi & Ringkasan */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 lg:h-auto min-h-0">
            
""" + diskusi_block + """

""" + ringkasan_block + """

          </div>

""" + materi_block + """

        </div>
      </div>

      """

new_content = before + new_kanan + after

with open("client/pages/MahasiswaSesiDetail.tsx", "w") as f:
    f.write(new_content)

print("Done")
