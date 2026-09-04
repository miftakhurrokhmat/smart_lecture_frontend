import re

with open("client/pages/MahasiswaSesiDetail.tsx", "r") as f:
    content = f.read()

# Locate the Middle Column
middle_col_start_str = "{/* Middle Column: Diskusi & Ringkasan */}"
middle_col_start = content.find(middle_col_start_str)

far_right_str = "{/* Far Right: Materi PDF Viewer */}"
far_right_start = content.find(far_right_str)

middle_col_content = content[middle_col_start:far_right_start]

# Inside middle_col_content, find the two blocks:
diskusi_start = middle_col_content.find("{/* Diskusi Dosen */}")
ringkasan_start = middle_col_content.find("{/* Ringkasan AI */}")

# Since Diskusi is currently above Ringkasan:
# Diskusi block is from diskusi_start to ringkasan_start
diskusi_block = middle_col_content[diskusi_start:ringkasan_start]

# Ringkasan block is from ringkasan_start to the end (but before the closing </div> of the column)
# We can find the closing </div> of the column which is just before far_right_str.
# It usually ends with `          </div>\n\n`
ringkasan_end = middle_col_content.rfind("</div>")

ringkasan_block = middle_col_content[ringkasan_start:ringkasan_end].rstrip() + "\n\n"

# The wrapping of the column ends with a </div>
column_end_tag = middle_col_content[ringkasan_end:]

# Reconstruct the middle column
new_middle_col = middle_col_content[:diskusi_start] + ringkasan_block + diskusi_block + column_end_tag

# Replace in full content
new_content = content[:middle_col_start] + new_middle_col + content[far_right_start:]

with open("client/pages/MahasiswaSesiDetail.tsx", "w") as f:
    f.write(new_content)

print("Swapped successfully")
