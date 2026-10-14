import struct
import sys
import zipfile

# FUNCTIONS
def dataOffset(raw, info):
    raw.seek(info.header_offset)
    header = raw.read(30)
    nameLen, extraLen = struct.unpack("<HH", header[26:30])
    return info.header_offset + 30 + nameLen + extraLen


def main(path):
    problems = []
    totalSize = 0
    with zipfile.ZipFile(path) as archive, open(path, "rb") as raw:
        names = archive.namelist()
        for required in ("AndroidManifest.xml", "classes.dex", "resources.arsc"):
            if required not in names:
                problems.append("missing " + required)
        for info in archive.infolist():
            totalSize += info.file_size
            if info.compress_type == zipfile.ZIP_STORED:
                offset = dataOffset(raw, info)
                if offset % 4 != 0:
                    problems.append("misaligned stored entry %s at %d" % (info.filename, offset))
            elif info.filename == "resources.arsc":
                problems.append("resources.arsc is compressed")
        assets = [n for n in names if n.startswith("assets/")]
        print("entries=%d assets=%d uncompressed=%.1fMB" % (len(names), len(assets), totalSize / 1e6))
    if problems:
        for problem in problems:
            print("PROBLEM:", problem)
        sys.exit(1)
    print("apk structure ok")


# INITIALIZATION
if __name__ == "__main__":
    main(sys.argv[1])
