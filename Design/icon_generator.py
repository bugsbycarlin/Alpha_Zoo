
import os
import sys

name = sys.argv[1]
icon = sys.argv[2]

print("Making icons")

# def place(item):
#   return os.path.join("", item)

os.system("mkdir %s.iconset" % name)
big_icon_path = "%s.iconset/icon_512x512.png" % name
os.system("cp %s %s" % (icon, big_icon_path))
for size in [16, 32, 128, 256]:
  little_icon_path = "%s.iconset/icon_%dx%d.png" % (name, size, size)
  os.system("sips -z %d %d %s --out %s" % (size, size, big_icon_path, little_icon_path))

os.system("iconutil -c icns -o %s %s" % ("%s.icns" % name, "%s.iconset" % name))


print("Finished")